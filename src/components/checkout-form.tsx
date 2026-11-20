"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart-context";
import { placeOrder, type PlaceOrderInput } from "@/app/actions/customer";
import { formatINR, round2 } from "@/lib/billing";
import type { Settings } from "@/lib/types";

type Props = {
  customer: { name: string; phone: string; type: "retail" | "contractor"; gstin: string };
  settings: Pick<Settings, "storeName" | "deliveryMinOrder" | "deliveryBaseFee" | "deliveryPerKm" | "deliveryMaxKm">;
};

export function CheckoutForm({ customer, settings }: Props) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [gstin, setGstin] = useState(customer.gstin);
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const itemsTotal = round2(subtotal);
  const belowMinimum = fulfilment === "delivery" && itemsTotal < settings.deliveryMinOrder;

  // The exact fee is calculated on the server when the order is placed (from the distance to your location).
  const deliveryLabel =
    fulfilment === "pickup" ? "₹0" : coords ? "calculated on placing order" : `from ${formatINR(settings.deliveryBaseFee)}`;

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available on this device. You can still enter your address.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Could not get your location. Please allow location access or enter your address.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit() {
    setError(null);
    if (items.length === 0) return setError("Your cart is empty.");
    if (fulfilment === "delivery" && !address.trim()) return setError("Please enter your delivery address.");
    if (belowMinimum) return setError(`Minimum order for delivery is ${formatINR(settings.deliveryMinOrder)}.`);

    const input: PlaceOrderInput = {
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      fulfilment,
      address: fulfilment === "delivery" ? address.trim() : undefined,
      lat: coords?.lat,
      lng: coords?.lng,
      paymentMethod: payment,
      gstin: customer.type === "contractor" ? gstin.trim() : undefined,
    };
    setSubmitting(true);
    try {
      const res = await placeOrder(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clear();
      router.push(`/orders/${res.orderId}?placed=1`);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="rounded-2xl bg-white p-8 text-center shadow-sm">Your cart is empty. <a href="/" className="font-semibold text-brand-700 underline">Shop now</a></p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-5 md:col-span-2">
        <h1 className="text-xl font-bold">Checkout</h1>

        <Card title="Your details">
          <p className="font-semibold">{customer.name}</p>
          <p className="text-sm text-gray-600">+91 {customer.phone}</p>
          {customer.type === "contractor" && (
            <label className="mt-3 block text-sm">
              GSTIN (needed for GST invoices)
              <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="33ABCDE1234F1Z5" />
            </label>
          )}
        </Card>

        <Card title="Fulfilment">
          <div className="grid grid-cols-2 gap-3">
            <Choice active={fulfilment === "delivery"} onClick={() => setFulfilment("delivery")} title="Home delivery" note={`Min. order ${formatINR(settings.deliveryMinOrder)}`} />
            <Choice active={fulfilment === "pickup"} onClick={() => setFulfilment("pickup")} title="Store pickup" note="No minimum, no charge" />
          </div>
          {fulfilment === "delivery" && (
            <div className="mt-4 space-y-3">
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Full delivery address, landmark and pincode" className="w-full rounded-xl border px-3 py-2" />
              <button type="button" onClick={useMyLocation} disabled={locating} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">
                {locating ? "Getting location…" : coords ? "📍 Location captured ✓" : "📍 Use my current location"}
              </button>
              <p className="text-xs text-gray-500">Your location sets the delivery charge by distance from the store. Deliveries are limited to {settings.deliveryMaxKm} km.</p>
            </div>
          )}
        </Card>

        <Card title="Payment">
          <div className="grid grid-cols-2 gap-3">
            <Choice active={payment === "cod"} onClick={() => setPayment("cod")} title="Cash on delivery" note="Pay when you receive" />
            <button type="button" disabled className="rounded-xl border-2 border-dashed border-gray-300 p-4 text-left opacity-60">
              <span className="block font-semibold">Pay online</span>
              <span className="text-xs text-gray-500">Coming soon</span>
            </button>
          </div>
        </Card>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm md:sticky md:top-24">
        <h2 className="font-bold">Order summary</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="truncate">{i.qty} × {i.name}</span>
              <span>{formatINR(i.qty * i.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Items (incl. GST)</span><span>{formatINR(itemsTotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{deliveryLabel}</span></div>
          <div className="flex justify-between text-xs text-gray-500"><span>GST is included in prices and shown on the invoice.</span></div>
        </div>
        {belowMinimum && <p className="mt-3 text-sm text-red-600">Add {formatINR(settings.deliveryMinOrder - itemsTotal)} more for delivery, or choose pickup.</p>}
        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button onClick={submit} disabled={submitting || belowMinimum} className="mt-4 w-full rounded-xl bg-accent-500 py-3 font-semibold text-white hover:bg-accent-600 disabled:opacity-50">
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Choice({ active, onClick, title, note }: { active: boolean; onClick: () => void; title: string; note: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-left ${active ? "border-brand-700 bg-brand-700/5" : "border-gray-200"}`}
    >
      <span className="block font-semibold">{title}</span>
      <span className="text-xs text-gray-500">{note}</span>
    </button>
  );
}
