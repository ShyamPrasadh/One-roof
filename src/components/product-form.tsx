"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProduct, type ProductInput } from "@/app/actions/admin";
import type { Category, Product } from "@/lib/types";

const empty: ProductInput = {
  name: "",
  brand: "",
  categoryId: "",
  description: "",
  price: 0,
  contractorPrice: undefined,
  unitLabel: "per unit",
  gstRate: 18,
  hsn: "",
  stock: 0,
  active: true,
  imageUrl: "",
};

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(product ?? { ...empty, categoryId: categories[0]?.id ?? "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await saveProduct({
      ...form,
      id: product?.id,
      price: Number(form.price),
      gstRate: Number(form.gstRate),
      stock: Number(form.stock),
      contractorPrice: form.contractorPrice === undefined || String(form.contractorPrice) === "" ? undefined : Number(form.contractorPrice),
    });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
      <Text label="Product name" value={form.name} onChange={(v) => set("name", v)} required />
      <Text label="Brand" value={form.brand} onChange={(v) => set("brand", v)} />
      <label className="text-sm font-medium">
        Category
        <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <Text label="Unit label (e.g. per bag, per kg)" value={form.unitLabel} onChange={(v) => set("unitLabel", v)} />
      <Text label="Price incl. GST (₹)" type="number" value={String(form.price)} onChange={(v) => set("price", Number(v))} required />
      <Text label="Contractor price incl. GST (optional)" type="number" value={String(form.contractorPrice ?? "")} onChange={(v) => set("contractorPrice", v === "" ? undefined : Number(v))} />
      <Text label="GST rate %" type="number" value={String(form.gstRate)} onChange={(v) => set("gstRate", Number(v))} />
      <Text label="HSN code" value={form.hsn} onChange={(v) => set("hsn", v)} />
      <Text label="Stock quantity" type="number" value={String(form.stock)} onChange={(v) => set("stock", Number(v))} />
      <Text label="Image URL (optional)" value={form.imageUrl ?? ""} onChange={(v) => set("imageUrl", v)} />
      <label className="text-sm font-medium md:col-span-2">
        Description
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
        <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
        Show this product in the shop
      </label>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 md:col-span-2">{error}</p>}
      <div className="flex gap-3 md:col-span-2">
        <button disabled={busy} className="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-xl border px-6 py-3">Cancel</button>
      </div>
    </form>
  );
}

function Text({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal" />
    </label>
  );
}
