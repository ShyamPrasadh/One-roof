import { LoginForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/safe-next";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Log in</h1>
      <LoginForm next={safeNext(next)} />
    </div>
  );
}
