"use server";

import { revalidatePath } from "next/cache";
import { readDb, writeDb } from "@/lib/store";
import { newId, normalizePhone, verifyPassword } from "@/lib/security";
import { clearAdminSession, currentAdmin, setAdminSession } from "@/lib/session";
import type { OrderStatus, Product, Settings } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<Result> {
  const admin = await currentAdmin();
  return admin ? { ok: true } : { ok: false, error: "Please log in as admin." };
}

export async function loginAdmin(input: { phone: string; password: string }): Promise<Result> {
  const phone = normalizePhone(input.phone);
  const admin = readDb().admins.find((a) => a.phone === phone);
  if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
    return { ok: false, error: "Wrong phone number or password." };
  }
  await setAdminSession(admin.id);
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
}

export type ProductInput = Omit<Product, "id" | "createdAt"> & { id?: string };

export async function saveProduct(input: ProductInput): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  if (!input.name.trim()) return { ok: false, error: "Product name is required." };
  if (!(input.price > 0)) return { ok: false, error: "Price must be more than zero." };
  if (input.gstRate < 0 || input.gstRate > 28) return { ok: false, error: "GST rate must be between 0 and 28." };
  if (input.stock < 0) return { ok: false, error: "Stock cannot be negative." };

  const db = readDb();
  const data = {
    name: input.name.trim(),
    brand: input.brand.trim(),
    categoryId: input.categoryId,
    description: input.description.trim(),
    price: Number(input.price),
    contractorPrice: input.contractorPrice ? Number(input.contractorPrice) : undefined,
    unitLabel: input.unitLabel.trim() || "per unit",
    gstRate: Number(input.gstRate),
    hsn: input.hsn.trim(),
    stock: Math.floor(Number(input.stock)),
    active: input.active,
    imageUrl: input.imageUrl?.trim() || undefined,
  };
  if (input.id) {
    const existing = db.products.find((p) => p.id === input.id);
    if (!existing) return { ok: false, error: "Product not found." };
    Object.assign(existing, data);
  } else {
    db.products.push({ id: newId("p"), createdAt: new Date().toISOString(), ...data });
  }
  writeDb(db);
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function setStock(productId: string, stock: number): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const db = readDb();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return { ok: false, error: "Product not found." };
  product.stock = Math.max(0, Math.floor(stock));
  writeDb(db);
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

const STATUS_FLOW: OrderStatus[] = ["placed", "confirmed", "out_for_delivery", "delivered"];

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const db = readDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "cancelled") return { ok: false, error: "A cancelled order cannot change." };

  if (status === "cancelled") {
    if (order.status === "delivered") return { ok: false, error: "A delivered order cannot be cancelled." };
    // Return the stock for each item.
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) product.stock += item.qty;
    }
  } else if (!STATUS_FLOW.includes(status)) {
    return { ok: false, error: "Unknown status." };
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeDb(db);
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { ok: true };
}

export async function markOrderPaid(orderId: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const db = readDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: "Order not found." };
  order.paymentStatus = "paid";
  order.updatedAt = new Date().toISOString();
  writeDb(db);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function saveSettings(input: Omit<Settings, "invoiceCounter">): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const db = readDb();
  db.settings = { ...db.settings, ...input };
  writeDb(db);
  revalidatePath("/", "layout");
  return { ok: true };
}
