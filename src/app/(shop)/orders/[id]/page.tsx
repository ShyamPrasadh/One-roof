import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentCustomer } from "@/lib/session";
import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";
import { StatusBadge } from "@/components/status-badge";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const customer = await currentCustomer();
  if (!customer) redirect(`/login?next=/orders/${id}`);
  const order = readDb().orders.find((o) => o.id === id && o.customerId === customer.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {placed && (
        <div className="rounded-2xl bg-green-50 p-4 text-green-800">
          Thank you! Your order is placed. We will confirm it shortly.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Order {order.invoiceNo}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">{order.fulfilment === "delivery" ? "Delivery" : "Store pickup"}</h2>
        {order.fulfilment === "delivery" && <p className="mt-1 text-sm text-gray-600">{order.address}</p>}
        <p className="mt-1 text-sm text-gray-600">Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} · {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}</p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Items</h2>
        <ul className="divide-y">
          {order.items.map((i) => (
            <li key={i.productId} className="flex justify-between py-3 text-sm">
              <span>
                <span className="font-semibold">{i.name}</span>
                <span className="block text-gray-500">{i.qty} × {formatINR(i.unitPrice)} {i.unitLabel}</span>
              </span>
              <span className="font-semibold">{formatINR(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Items</span><span>{formatINR(order.itemsTotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{formatINR(order.deliveryFee)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Included GST</span><span>{formatINR(order.gstTotal)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatINR(order.total)}</span></div>
        </div>
      </section>

      <Link href={`/invoice/${order.id}`} className="inline-block rounded-xl border px-4 py-2 font-medium hover:bg-white">
        View GST invoice
      </Link>
    </div>
  );
}
