"use client";

import { useState } from "react";
import { useCart } from "./cart-context";

export function AddToCart({
  product,
  disabled,
}: {
  product: { id: string; name: string; brand: string; unitLabel: string; price: number };
  disabled?: boolean;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  if (disabled) {
    return <button disabled className="w-full rounded-xl bg-gray-300 py-3 font-semibold text-gray-600">Out of stock</button>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-xl border border-gray-300 bg-white">
        <button className="px-4 py-2 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
        <span className="w-10 text-center font-semibold">{qty}</span>
        <button className="px-4 py-2 text-lg" onClick={() => setQty((q) => Math.min(1000, q + 1))} aria-label="Increase">+</button>
      </div>
      <button
        className="flex-1 rounded-xl bg-accent-500 py-3 font-semibold text-white hover:bg-accent-600"
        onClick={() => {
          add({ productId: product.id, name: product.name, brand: product.brand, unitLabel: product.unitLabel, price: product.price }, qty);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }}
      >
        {done ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
