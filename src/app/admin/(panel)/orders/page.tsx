import Link from "next/link";
import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";
import { StatusBadge } from "@/components/status-badge";
import { OrderControls } from "@/components/order-controls";

export default function AdminOrdersPage() {
  const orders = readDb().orders;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      {orders.length === 0 && <p className="rounded-xl bg-white p-6 text-gray-500">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{o.invoiceNo} <StatusBadge status={o.status} /></p>
              <p className="text-sm text-gray-600">
                {o.customerName} · +91 {o.customerPhone} · {o.customerType === "contractor" ? "Contractor" : "Retail"}
                {o.gstin ? ` · GSTIN ${o.gstin}` : ""}
              </p>
              <p className="text-sm text-gray-600">
                {o.fulfilment === "delivery"
                  ? `Delivery: ${o.address}${o.distanceKm != null ? ` (${o.distanceKm} km)` : ""}`
                  : "Store pickup"}
              </p>
              <p className="text-sm text-gray-600">
                {o.paymentMethod === "cod" ? "Cash on delivery" : "Online"} · {o.paymentStatus === "paid" ? "Paid" : "Unpaid"} · {new Date(o.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatINR(o.total)}</p>
              <Link href={`/invoice/${o.id}`} className="text-sm font-semibold text-brand-700">Invoice</Link>
            </div>
          </div>
          <ul className="mt-3 divide-y rounded-xl bg-gray-50 px-3 text-sm">
            {o.items.map((i) => (
              <li key={i.productId} className="flex justify-between py-2">
                <span>{i.qty} × {i.brand} {i.name} ({i.unitLabel})</span>
                <span>{formatINR(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <OrderControls orderId={o.id} status={o.status} paid={o.paymentStatus === "paid"} />
          </div>
        </div>
      ))}
    </div>
  );
}
