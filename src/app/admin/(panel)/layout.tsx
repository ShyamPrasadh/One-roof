import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/session";
import { logoutAdmin } from "@/app/actions/admin";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-brand-900 text-white md:w-56 md:min-h-screen">
        <div className="flex items-center justify-between p-4 md:block">
          <span className="font-bold">One Roof Admin</span>
          <form action={logoutAdmin} className="md:mt-4">
            <button className="text-sm text-white/70 underline">Log out</button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 text-sm md:flex-col md:gap-0.5">
          {[
            ["/admin", "Dashboard"],
            ["/admin/orders", "Orders"],
            ["/admin/products", "Products & stock"],
            ["/admin/settings", "Settings"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-white/85 hover:bg-white/10">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

