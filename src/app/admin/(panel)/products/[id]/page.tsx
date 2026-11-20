import { notFound } from "next/navigation";
import { readDb } from "@/lib/store";
import { ProductForm } from "@/components/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { products, categories } = readDb();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
