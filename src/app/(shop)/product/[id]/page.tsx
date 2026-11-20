import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";
import { currentCustomer } from "@/lib/session";
import { AddToCart } from "@/components/add-to-cart";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDb();
  const product = db.products.find((p) => p.id === id && p.active);
  if (!product) notFound();

  const customer = await currentCustomer();
  const category = db.categories.find((c) => c.id === product.categoryId);
  const price =
    customer?.type === "contractor" && product.contractorPrice !== undefined ? product.contractorPrice : product.price;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid aspect-square place-items-center rounded-2xl bg-white text-8xl shadow-sm">
        {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : "🧱"}
      </div>

      <div className="space-y-4">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">Shop</Link>
          {category && (
            <>
              {" / "}
              <Link href={`/?cat=${category.id}`} className="hover:underline">{category.name}</Link>
            </>
          )}
        </nav>
        <p className="text-sm font-semibold uppercase text-brand-500">{product.brand}</p>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

        <div>
          <span className="text-3xl font-bold">{formatINR(price)}</span>
          <span className="text-gray-500"> {product.unitLabel}</span>
          <p className="text-xs text-gray-500">Inclusive of GST ({product.gstRate}%)</p>
          {customer?.type === "contractor" && product.contractorPrice !== undefined && (
            <p className="mt-1 text-sm font-medium text-green-700">Contractor price applied</p>
          )}
        </div>

        {product.description && <p className="text-gray-700">{product.description}</p>}

        <p className="text-sm">
          {product.stock > 0 ? (
            <span className="font-medium text-green-700">In stock</span>
          ) : (
            <span className="font-medium text-red-600">Out of stock</span>
          )}
        </p>

        <AddToCart
          product={{ id: product.id, name: product.name, brand: product.brand, unitLabel: product.unitLabel, price }}
          disabled={product.stock === 0}
        />
      </div>
    </div>
  );
}
