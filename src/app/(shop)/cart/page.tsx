"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatINR } from "@/lib/billing";

export default function CartPage() {
  const { items, subtotal, setQty, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-5xl">🛒</p>
        <p className="mt-3 font-semibold">Your cart is empty</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <section className="space-y-3 md:col-span-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Cart</h1>
          <button onClick={clear} className="text-sm text-red-600 hover:underline">Clear cart</button>
        </div>
        {items.map((i) => (
          <div key={i.productId} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-surface text-2xl">🧱</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-brand-500">{i.brand}</p>
              <p className="truncate font-semibold">{i.name}</p>
              <p className="text-sm text-gray-500">{formatINR(i.price)} {i.unitLabel}</p>
            </div>
            <div className="flex items-center rounded-xl border">
              <button className="px-3 py-1" onClick={() => setQty(i.productId, i.qty - 1)} aria-label="Decrease">−</button>
              <span className="w-8 text-center font-semibold">{i.qty}</span>
              <button className="px-3 py-1" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="Increase">+</button>
            </div>
            <div className="w-24 text-right">
              <p className="font-bold">{formatINR(i.qty * i.price)}</p>
              <button onClick={() => remove(i.productId)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </section>

      <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm md:sticky md:top-24">
        <h2 className="font-bold">Summary</h2>
        <div className="mt-3 flex justify-between text-sm">
          <span>Items total (incl. GST)</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Delivery charge and final GST invoice amounts are confirmed at checkout.</p>
        <Link href="/checkout" className="mt-4 block rounded-xl bg-accent-500 py-3 text-center font-semibold text-white hover:bg-accent-600">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
