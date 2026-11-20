import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-900 p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-xl font-bold text-white">One Roof Admin</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
