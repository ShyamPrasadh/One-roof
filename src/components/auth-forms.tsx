"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginCustomer, registerCustomer } from "@/app/actions/customer";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await loginCustomer({ phone, password });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="Mobile number" value={phone} onChange={setPhone} type="tel" placeholder="10-digit mobile" />
      <Field label="Password" value={password} onChange={setPassword} type="password" />
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-accent-500 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm">
        New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<"retail" | "contractor">("retail");
  const [gstin, setGstin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await registerCustomer({ name, phone, password, type, gstin });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="Full name" value={name} onChange={setName} />
      <Field label="Mobile number" value={phone} onChange={setPhone} type="tel" placeholder="10-digit mobile" />
      <Field label="Password (min. 6 characters)" value={password} onChange={setPassword} type="password" />
      <div>
        <p className="mb-2 text-sm font-medium">I am a</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setType("retail")} className={`rounded-xl border-2 p-3 text-sm font-semibold ${type === "retail" ? "border-brand-700 bg-brand-700/5" : "border-gray-200"}`}>Homeowner / retail</button>
          <button type="button" onClick={() => setType("contractor")} className={`rounded-xl border-2 p-3 text-sm font-semibold ${type === "contractor" ? "border-brand-700 bg-brand-700/5" : "border-gray-200"}`}>Contractor / builder</button>
        </div>
      </div>
      {type === "contractor" && (
        <Field label="GSTIN (optional, for GST invoices)" value={gstin} onChange={(v) => setGstin(v.toUpperCase())} placeholder="15-character GSTIN" required={false} />
      )}
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-accent-500 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm">
        Already registered? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700">Log in</Link>
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-brand-500"
      />
    </label>
  );
}
