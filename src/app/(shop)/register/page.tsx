import { RegisterForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/safe-next";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Create account</h1>
      <RegisterForm next={safeNext(next)} />
    </div>
  );
}
