import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";

export default function DashboardPage() {
  const { orders, products } = readDb();
  const today = new Date().toDateString();
  const todays = orders.filter((o) => new Date(o.createdAt).toDateString() === today && o.status !== "cancelled");
  const open = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const lowStock = products.filter((p) => p.active && p.stock <= 10);
  const revenueToday = todays.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Orders today" value={String(todays.length)} />
        <Stat label="Sales today (incl. GST)" value={formatINR(revenueToday)} />
        <Stat label="Open orders" value={String(open.length)} />
        <Stat label="Low-stock items" value={String(lowStock.length)} />
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-700">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <ul className="divide-y">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="font-semibold">{o.invoiceNo}</span> · {o.customerName}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">{formatINR(o.total)}</span>
                  <StatusBadge status={o.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lowStock.length > 0 && (
        <section className="rounded-2xl bg-amber-50 p-5">
          <h2 className="font-bold text-amber-900">Low stock</h2>
          <ul className="mt-2 text-sm">
            {lowStock.map((p) => (
              <li key={p.id}>{p.brand} {p.name}: {p.stock} left</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
