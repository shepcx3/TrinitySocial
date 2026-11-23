import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-extrabold text-qu-blue">Queen&apos;s U Tix</h1>
      <p className="mt-3 text-lg text-slate-700">
        Tickets to Queen&apos;s events, bought and sold only by verified Gaels.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {user ? (
          <span className="rounded-lg bg-qu-gold px-4 py-2 font-semibold text-qu-blue">
            Signed in as {user.name}{user.emailVerified ? "" : " (unverified)"}
          </span>
        ) : (
          <>
            <Link href="/signup" className="rounded-lg bg-qu-blue px-5 py-2.5 font-semibold text-white">Sign up</Link>
            <Link href="/login" className="rounded-lg border border-qu-blue px-5 py-2.5 font-semibold text-qu-blue">Log in</Link>
          </>
        )}
      </div>
    </main>
  );
}
