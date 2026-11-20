"use client";

import { useTransition } from "react";
import { markOrderPaid, setOrderStatus } from "@/app/actions/admin";
import { STATUS_LABEL } from "./status-badge";
import type { OrderStatus } from "@/lib/types";

const NEXT: OrderStatus[] = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"];

export function OrderControls({ orderId, status, paid }: { orderId: string; status: OrderStatus; paid: boolean }) {
  const [pending, start] = useTransition();
  const locked = status === "cancelled";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        disabled={pending || locked}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          if (next === "cancelled" && !confirm("Cancel this order? Stock will be returned.")) return;
          start(async () => {
            await setOrderStatus(orderId, next);
          });
        }}
        className="rounded-lg border px-2 py-1.5 text-sm"
      >
        {NEXT.map((s) => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>
      {!paid && !locked && (
        <button
          disabled={pending}
          onClick={() => start(async () => void (await markOrderPaid(orderId)))}
          className="rounded-lg border border-green-600 px-3 py-1.5 text-sm font-semibold text-green-700 hover:bg-green-50"
        >
          Mark as paid
        </button>
      )}
    </div>
  );
}
