import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign up · Queen's U Tix" };

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-qu-blue">Join Queen&apos;s U Tix</h1>
      <p className="mb-6 text-sm text-slate-600">Only verified @queensu.ca students can buy and sell.</p>
      <AuthForm mode="signup" />
    </main>
  );
}
