"use server";

import { revalidatePath } from "next/cache";
import { readDb, writeDb } from "@/lib/store";
import { hashPassword, newId, normalizePhone, verifyPassword } from "@/lib/security";
import { clearCustomerSession, currentCustomer, setCustomerSession } from "@/lib/session";
import { deliveryQuote } from "@/lib/delivery";
import { invoiceNumber, round2, splitInclusive } from "@/lib/billing";
import type { Order, OrderItem, PaymentMethod } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerCustomer(input: {
  name: string;
  phone: string;
  password: string;
  type: "retail" | "contractor";
  gstin?: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (!name) return { ok: false, error: "Please enter your name." };
  if (phone.length !== 10) return { ok: false, error: "Enter a valid 10-digit mobile number." };
  if (input.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const db = readDb();
  if (db.customers.some((c) => c.phone === phone)) {
    return { ok: false, error: "An account with this number already exists. Please log in." };
  }
  const gstin = input.type === "contractor" ? input.gstin?.trim().toUpperCase() || undefined : undefined;
  const customer = {
    id: newId("c"),
    name,
    phone,
    passwordHash: hashPassword(input.password),
    type: input.type,
    gstin,
    createdAt: new Date().toISOString(),
  };
  db.customers.push(customer);
  writeDb(db);
  await setCustomerSession(customer.id);
  return { ok: true };
}

export async function loginCustomer(input: { phone: string; password: string }): Promise<ActionResult> {
  const phone = normalizePhone(input.phone);
  const customer = readDb().customers.find((c) => c.phone === phone);
  if (!customer || !verifyPassword(input.password, customer.passwordHash)) {
    return { ok: false, error: "Wrong mobile number or password." };
  }
  await setCustomerSession(customer.id);
  return { ok: true };
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerSession();
}

export type CartLine = { productId: string; qty: number };

export type PlaceOrderInput = {
  items: CartLine[];
  fulfilment: "delivery" | "pickup";
  address?: string;
  lat?: number;
  lng?: number;
  paymentMethod: PaymentMethod;
  gstin?: string;
};

export async function placeOrder(input: PlaceOrderInput): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const sessionCustomer = await currentCustomer();
  if (!sessionCustomer) return { ok: false, error: "Please log in to place an order." };
  if (input.items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (input.paymentMethod === "online") {
    return { ok: false, error: "Online payment is not set up yet. Please choose cash on delivery." };
  }

  const db = readDb();
  const { settings } = db;
  // Re-read from the database so updates below apply to the stored record.
  const customer = db.customers.find((c) => c.id === sessionCustomer.id)!;

  if (customer.type === "contractor" && input.gstin !== undefined) {
    const gstin = input.gstin.trim().toUpperCase();
    if (gstin && !/^[0-9A-Z]{15}$/.test(gstin)) return { ok: false, error: "GSTIN must be 15 characters." };
    customer.gstin = gstin || undefined;
  }

  // Build lines from server-side prices and check stock.
  const items: OrderItem[] = [];
  for (const line of input.items) {
    const qty = Math.floor(line.qty);
    if (!Number.isFinite(qty) || qty < 1 || qty > 1000) return { ok: false, error: "Invalid quantity." };
    const product = db.products.find((p) => p.id === line.productId && p.active);
    if (!product) return { ok: false, error: "A product in your cart is no longer available." };
    if (product.stock < qty) {
      return { ok: false, error: `Only ${product.stock} left of ${product.name}.` };
    }
    const unitPrice =
      customer.type === "contractor" && product.contractorPrice !== undefined ? product.contractorPrice : product.price;
    const lineTotal = round2(unitPrice * qty);
    const { taxable, gst } = splitInclusive(lineTotal, product.gstRate);
    items.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      unitLabel: product.unitLabel,
      qty,
      unitPrice,
      gstRate: product.gstRate,
      hsn: product.hsn,
      taxable,
      gst,
      lineTotal,
    });
  }

  const itemsTotal = round2(items.reduce((s, i) => s + i.lineTotal, 0));

  // Delivery: minimum order and distance-based fee. Pickup has neither.
  let deliveryFee = 0;
  let distance: number | null = null;
  let address: string | undefined;
  if (input.fulfilment === "delivery") {
    address = input.address?.trim();
    if (!address) return { ok: false, error: "Please enter your delivery address." };
    if (itemsTotal < settings.deliveryMinOrder) {
      return { ok: false, error: `Minimum order for delivery is ₹${settings.deliveryMinOrder}. Add more items or choose pickup.` };
    }
    try {
      const quote = deliveryQuote(settings, input.lat, input.lng);
      deliveryFee = quote.fee;
      distance = quote.distanceKm;
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  const delivery = splitInclusive(deliveryFee, 18);

  const taxableTotal = round2(items.reduce((s, i) => s + i.taxable, 0) + delivery.taxable);
  const gstTotal = round2(items.reduce((s, i) => s + i.gst, 0) + delivery.gst);
  const total = round2(itemsTotal + deliveryFee);

  // Commit: decrement stock, assign invoice number, save order.
  for (const line of input.items) {
    const product = db.products.find((p) => p.id === line.productId)!;
    product.stock -= Math.floor(line.qty);
  }
  settings.invoiceCounter += 1;
  const now = new Date().toISOString();
  const order: Order = {
    id: newId("o"),
    invoiceNo: invoiceNumber(settings.invoiceCounter),
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerType: customer.type,
    gstin: customer.gstin,
    fulfilment: input.fulfilment,
    address,
    lat: input.fulfilment === "delivery" ? input.lat : undefined,
    lng: input.fulfilment === "delivery" ? input.lng : undefined,
    distanceKm: distance,
    items,
    itemsTotal,
    deliveryFee,
    deliveryGst: delivery.gst,
    deliveryTaxable: delivery.taxable,
    taxableTotal,
    gstTotal,
    total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "unpaid",
    status: "placed",
    createdAt: now,
    updatedAt: now,
  };
  db.orders.unshift(order);
  writeDb(db);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, orderId: order.id };
}
