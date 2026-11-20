import { readDb } from "@/lib/store";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm categories={readDb().categories} />
    </div>
  );
}
