"use client";

import { useState, useTransition } from "react";
import { setStock } from "@/app/actions/admin";

export function StockInput({ productId, initial }: { productId: string; initial: number }) {
  const [value, setValue] = useState(String(initial));
  const [pending, start] = useTransition();
  return (
    <input
      type="number"
      min={0}
      value={value}
      disabled={pending}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const n = Number(value);
        if (Number.isFinite(n) && n !== initial) start(() => void setStock(productId, n));
      }}
      className="w-24 rounded-lg border px-2 py-1"
    />
  );
}
