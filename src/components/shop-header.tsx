"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-context";

export function ShopHeader({ storeName, loggedInName }: { storeName: string; loggedInName: string | null }) {
  const { count } = useCart();
  const path = usePathname();
  const navItems = [
    { href: "/", label: "Shop", icon: "🏠" },
    { href: "/cart", label: "Cart", icon: "🛒", badge: count },
    { href: "/orders", label: "Orders", icon: "📦" },
    { href: loggedInName ? "/orders" : "/login", label: loggedInName ? loggedInName.split(" ")[0] : "Login", icon: "👤" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-brand-700 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-500 text-sm">OR</span>
            <span className="hidden sm:inline">{storeName}</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/" className="hover:text-accent-500">Shop</Link>
            <Link href="/orders" className="hover:text-accent-500">My orders</Link>
            {loggedInName ? (
              <span className="text-white/80">Hi, {loggedInName.split(" ")[0]}</span>
            ) : (
              <Link href="/login" className="hover:text-accent-500">Login / Sign up</Link>
            )}
            <Link href="/cart" className="rounded-lg bg-accent-500 px-4 py-2 font-semibold hover:bg-accent-600">
              Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </nav>
          <Link href="/cart" className="relative rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold md:hidden">
            🛒 {count}
          </Link>
        </div>
      </header>

      {/* Bottom navigation for phones, quick-commerce style */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white md:hidden">
        <ul className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = item.href === "/" ? path === "/" : path?.startsWith(item.href);
            return (
              <li key={item.label}>
                <Link href={item.href} className={`relative flex flex-col items-center py-2 text-xs ${active ? "font-bold text-brand-700" : "text-gray-500"}`}>
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                  {item.badge ? (
                    <span className="absolute right-6 top-1 rounded-full bg-accent-500 px-1.5 text-[10px] text-white">{item.badge}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
