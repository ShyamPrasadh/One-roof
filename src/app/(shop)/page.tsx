import Link from "next/link";
import { readDb } from "@/lib/store";
import { formatINR } from "@/lib/billing";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q = "", cat = "" } = await searchParams;
  const { categories, products } = readDb();
  const term = q.trim().toLowerCase();

  const visible = products.filter(
    (p) =>
      p.active &&
      (!cat || p.categoryId === cat) &&
      (!term || `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white md:p-10">
        <h1 className="text-2xl font-bold md:text-4xl">Building materials, delivered to your site</h1>
        <p className="mt-2 max-w-xl text-white/85">Cement, sand, pipes, paints and more from trusted brands. Order in minutes.</p>
        <form className="mt-5 flex max-w-xl gap-2">
          <input type="hidden" name="cat" value={cat} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search cement, UPVC pipe, paint…"
            className="flex-1 rounded-xl px-4 py-3 text-gray-900 outline-none"
          />
          <button className="rounded-xl bg-accent-500 px-5 font-semibold hover:bg-accent-600">Search</button>
        </form>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link href="/" className={chip(!cat)}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/?cat=${c.id}`} className={chip(cat === c.id)}>
            {c.name}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-gray-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="mb-3 grid aspect-square place-items-center rounded-xl bg-surface text-4xl">
                {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" /> : "🧱"}
              </div>
              <span className="text-xs font-medium uppercase text-brand-500">{p.brand}</span>
              <span className="line-clamp-2 font-semibold text-gray-900">{p.name}</span>
              <div className="mt-auto pt-2">
                <span className="font-bold text-gray-900">{formatINR(p.price)}</span>
                <span className="text-xs text-gray-500"> {p.unitLabel}</span>
              </div>
              {p.stock === 0 && <span className="mt-1 text-xs font-semibold text-red-600">Out of stock</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function chip(active: boolean) {
  return `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
    active ? "bg-brand-700 text-white" : "bg-white text-gray-700 shadow-sm"
  }`;
}
