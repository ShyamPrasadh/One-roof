import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/lib/session";
import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";
import { StatusBadge } from "@/components/status-badge";
import { logoutCustomer } from "@/app/actions/customer";

export default async function OrdersPage() {
  const customer = await currentCustomer();
  if (!customer) redirect("/login?next=/orders");
  const orders = readDb().orders.filter((o) => o.customerId === customer.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My orders</h1>
          <p className="text-sm text-gray-500">{customer.name} · {customer.type === "contractor" ? "Contractor account" : "Retail account"}</p>
        </div>
        <form action={logoutCustomer}>
          <button className="text-sm text-gray-600 underline">Log out</button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-5xl">📦</p>
          <p className="mt-3">No orders yet.</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-accent-500 px-5 py-3 font-semibold text-white">Shop now</Link>
        </div>
      ) : (
        orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{o.invoiceNo}</span>
              <StatusBadge status={o.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.length} item(s) · {o.fulfilment === "delivery" ? "Delivery" : "Pickup"}
            </p>
            <p className="mt-2 font-bold">{formatINR(o.total)}</p>
          </Link>
        ))
      )}
    </div>
  );
}
