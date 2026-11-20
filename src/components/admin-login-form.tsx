"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAdmin } from "@/app/actions/admin";

export function AdminLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await loginAdmin({ phone, password });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow">
      <label className="block text-sm font-medium">
        Admin phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal" />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal" />
      </label>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-brand-700 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
