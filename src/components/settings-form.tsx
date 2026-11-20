"use client";

import { useState } from "react";
import { saveSettings } from "@/app/actions/admin";
import type { Settings } from "@/lib/types";

type Editable = Omit<Settings, "invoiceCounter">;

export function SettingsForm({ initial }: { initial: Editable }) {
  const [form, setForm] = useState<Record<keyof Editable, string>>(
    Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, String(v)])) as Record<keyof Editable, string>,
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const field = (key: keyof Editable, label: string, type = "text", note?: string) => (
    <label className="text-sm font-medium">
      {label}
      <input type={type} step="any" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-normal" />
      {note && <span className="text-xs font-normal text-gray-500">{note}</span>}
    </label>
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await saveSettings({
      storeName: form.storeName.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      address: form.address.trim(),
      stateName: form.stateName.trim(),
      stateCode: form.stateCode.trim(),
      phone: form.phone.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      deliveryBaseFee: Number(form.deliveryBaseFee),
      deliveryPerKm: Number(form.deliveryPerKm),
      deliveryMinOrder: Number(form.deliveryMinOrder),
      deliveryMaxKm: Number(form.deliveryMaxKm),
    });
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: "Settings saved." } : { ok: false, text: res.error });
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Section title="Business details (shown on invoices)">
        {field("storeName", "Business name")}
        {field("gstin", "GSTIN", "text", "15-character GST number")}
        {field("phone", "Phone")}
        {field("address", "Address")}
        {field("stateName", "State")}
        {field("stateCode", "State code", "text", "Tamil Nadu = 33")}
      </Section>
      <Section title="Store location and delivery pricing">
        {field("lat", "Store latitude", "number", "Set this to the exact store location")}
        {field("lng", "Store longitude", "number")}
        {field("deliveryBaseFee", "Base delivery fee (₹)", "number")}
        {field("deliveryPerKm", "Extra per km (₹)", "number")}
        {field("deliveryMinOrder", "Minimum order for delivery (₹)", "number", "Pickup has no minimum")}
        {field("deliveryMaxKm", "Maximum delivery distance (km)", "number")}
      </Section>
      {msg && <p className={`rounded-lg p-2 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button disabled={busy} className="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
