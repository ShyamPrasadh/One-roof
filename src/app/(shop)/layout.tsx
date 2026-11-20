import { CartProvider } from "@/components/cart-context";
import { ShopHeader } from "@/components/shop-header";
import { readDb } from "@/lib/store";
import { currentCustomer } from "@/lib/session";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { settings } = readDb();
  const customer = await currentCustomer();
  return (
    <CartProvider>
      <ShopHeader storeName={settings.storeName} loggedInName={customer?.name ?? null} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 md:pb-10">{children}</main>
    </CartProvider>
  );
}
