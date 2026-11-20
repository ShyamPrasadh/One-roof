import { notFound, redirect } from "next/navigation";
import { currentAdmin, currentCustomer } from "@/lib/session";
import { readDb } from "@/lib/store";
import { formatINR, gstSplit } from "@/lib/billing";
import { PrintButton } from "@/components/print-button";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) notFound();

  const customer = await currentCustomer();
  const admin = await currentAdmin();
  if (!admin && customer?.id !== order.customerId) {
    redirect(customer ? "/orders" : `/login?next=/invoice/${id}`);
  }

  const { settings } = db;
  const delivery = { taxable: order.deliveryTaxable, gst: order.deliveryGst };
  // Every buyer is in the store's state for now, so GST is shown as CGST + SGST.
  const split = gstSplit(order.gstTotal, undefined, settings.stateCode);
  const isB2B = order.customerType === "contractor" && !!order.gstin;

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl bg-white p-8 shadow print:shadow-none">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-700">{settings.storeName}</h1>
            <p className="text-sm text-gray-600">{settings.address}</p>
            {settings.gstin && <p className="text-sm text-gray-600">GSTIN: {settings.gstin}</p>}
            {settings.phone && <p className="text-sm text-gray-600">Phone: {settings.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{isB2B ? "TAX INVOICE" : "INVOICE"}</p>
            <p className="text-sm">No: {order.invoiceNo}</p>
            <p className="text-sm">Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm">
          <p className="font-semibold">Bill to</p>
          <p>{order.customerName}</p>
          <p>+91 {order.customerPhone}</p>
          {order.gstin && <p>GSTIN: {order.gstin}</p>}
          {order.fulfilment === "delivery" && <p>Ship to: {order.address}</p>}
          <p className="mt-1 text-gray-500">Place of supply: {settings.stateName} ({settings.stateCode})</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-2">#</th>
              <th>Item</th>
              <th>HSN</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Taxable</th>
              <th className="text-right">GST %</th>
              <th className="text-right">GST</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i, idx) => (
              <tr key={i.productId} className="border-b">
                <td className="py-2">{idx + 1}</td>
                <td>{i.brand} {i.name}</td>
                <td>{i.hsn}</td>
                <td className="text-right">{i.qty}</td>
                <td className="text-right">{formatINR(round(i.unitPrice - i.unitPrice * i.gstRate / (100 + i.gstRate)))}</td>
                <td className="text-right">{formatINR(i.taxable)}</td>
                <td className="text-right">{i.gstRate}%</td>
                <td className="text-right">{formatINR(i.gst)}</td>
                <td className="text-right">{formatINR(i.lineTotal)}</td>
              </tr>
            ))}
            {order.fulfilment === "delivery" && order.deliveryFee > 0 && (
              <tr className="border-b">
                <td className="py-2">{order.items.length + 1}</td>
                <td>Delivery charges</td>
                <td>996511</td>
                <td className="text-right">1</td>
                <td className="text-right">{formatINR(delivery.taxable)}</td>
                <td className="text-right">{formatINR(delivery.taxable)}</td>
                <td className="text-right">18%</td>
                <td className="text-right">{formatINR(delivery.gst)}</td>
                <td className="text-right">{formatINR(order.deliveryFee)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ml-auto mt-6 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><span>Taxable value</span><span>{formatINR(order.taxableTotal)}</span></div>
          {split.igst > 0 ? (
            <div className="flex justify-between"><span>IGST</span><span>{formatINR(split.igst)}</span></div>
          ) : (
            <>
              <div className="flex justify-between"><span>CGST</span><span>{formatINR(split.cgst)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>{formatINR(split.sgst)}</span></div>
            </>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Grand total</span><span>{formatINR(order.total)}</span></div>
          <p className="text-xs text-gray-500">Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} ({order.paymentStatus})</p>
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">Thank you for your business.</p>
        <div className="mt-6 text-center">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}

function round(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
