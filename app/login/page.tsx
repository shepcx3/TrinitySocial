import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Log in · Queen's U Tix" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-qu-blue">Log in</h1>
      <AuthForm mode="login" />
    </main>
  );
}
