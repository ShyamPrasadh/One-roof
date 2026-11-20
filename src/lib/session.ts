import { cookies } from "next/headers";
import { readDb } from "./store";
import { signToken, verifyToken } from "./security";
import type { Admin, Customer } from "./types";

const CUSTOMER_COOKIE = "or_customer";
const ADMIN_COOKIE = "or_admin";
const isProd = process.env.NODE_ENV === "production";

export async function setCustomerSession(customerId: string) {
  (await cookies()).set(CUSTOMER_COOKIE, signToken({ sub: customerId }), sessionOptions());
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function setAdminSession(adminId: string) {
  (await cookies()).set(ADMIN_COOKIE, signToken({ sub: adminId, role: "admin" }, 7), sessionOptions(7));
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function currentCustomer(): Promise<Customer | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  const data = verifyToken<{ sub: string }>(token);
  if (!data) return null;
  return readDb().customers.find((c) => c.id === data.sub) ?? null;
}

export async function currentAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const data = verifyToken<{ sub: string; role: string }>(token);
  if (!data || data.role !== "admin") return null;
  return readDb().admins.find((a) => a.id === data.sub) ?? null;
}

function sessionOptions(days = 30) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: days * 24 * 60 * 60,
  };
}
