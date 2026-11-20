import Link from "next/link";
import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";
import { StockInput } from "@/components/stock-input";

export default function AdminProductsPage() {
  const { products, categories } = readDb();
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products & stock</h1>
        <Link href="/admin/products/new" className="rounded-xl bg-accent-500 px-4 py-2 font-semibold text-white">+ Add product</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th>Category</th>
              <th>Price (incl. GST)</th>
              <th>GST / HSN</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <span className="font-semibold">{p.name}</span>
                  <span className="block text-xs text-gray-500">{p.brand}</span>
                </td>
                <td>{catName(p.categoryId)}</td>
                <td>{formatINR(p.price)} <span className="text-xs text-gray-500">{p.unitLabel}</span></td>
                <td>{p.gstRate}% / {p.hsn}</td>
                <td><StockInput productId={p.id} initial={p.stock} /></td>
                <td>{p.active ? <span className="text-green-700">Active</span> : <span className="text-gray-500">Hidden</span>}</td>
                <td className="pr-4 text-right"><Link href={`/admin/products/${p.id}`} className="font-semibold text-brand-700">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
