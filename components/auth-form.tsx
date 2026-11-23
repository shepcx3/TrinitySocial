"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { FACULTIES } from "@/lib/queens";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");

    if (mode === "signup") {
      const faculty = String(f.get("faculty") ?? "") || undefined;
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: String(f.get("name") ?? "").trim(),
        faculty,
      } as Parameters<typeof authClient.signUp.email>[0]);
      setPending(false);
      if (error) return setError(error.message ?? "Could not create account.");
      setNotice("Check your @queensu.ca inbox for a verification link.");
      router.refresh();
      return;
    }

    const { error } = await authClient.signIn.email({ email, password });
    setPending(false);
    if (error) return setError(error.message ?? "Could not sign in.");
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <>
          <label className="block">
            <span className="text-sm font-medium text-qu-blue">Name</span>
            <input name="name" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-qu-blue">Faculty (optional)</span>
            <select name="faculty" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Prefer not to say</option>
              {FACULTIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <label className="block">
        <span className="text-sm font-medium text-qu-blue">Queen&apos;s email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@queensu.ca"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-qu-blue">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      {error && <p role="alert" className="text-sm text-qu-red">{error}</p>}
      {notice && <p className="text-sm text-qu-blue">{notice}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-qu-blue px-4 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        {mode === "signup" ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-qu-blue underline">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="font-semibold text-qu-blue underline">Sign up</Link></>
        )}
      </p>
    </form>
  );
}
