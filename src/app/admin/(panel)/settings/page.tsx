import { readDb } from "@/lib/store";
import { SettingsForm } from "@/components/settings-form";

export default function AdminSettingsPage() {
  const { invoiceCounter: _ignored, ...editable } = readDb().settings;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm initial={editable} />
    </div>
  );
}
