"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type CartItem = { productId: string; name: string; brand: string; unitLabel: string; price: number; qty: number };

const KEY = "or_cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cached: CartItem[] = EMPTY;
let cachedRaw: string | null = null;

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(items: CartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

type CartApi = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    const current = read();
    const existing = current.find((i) => i.productId === item.productId);
    const next = existing
      ? current.map((i) => (i.productId === item.productId ? { ...i, qty: Math.min(i.qty + qty, 1000) } : i))
      : [...current, { ...item, qty }];
    write(next);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const q = Math.max(0, Math.min(1000, Math.floor(qty)));
    write(q === 0 ? read().filter((i) => i.productId !== productId) : read().map((i) => (i.productId === productId ? { ...i, qty: q } : i)));
  }, []);

  const remove = useCallback((productId: string) => write(read().filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartApi>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
