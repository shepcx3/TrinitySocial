import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCad } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: { listings: { where: { status: "ACTIVE", quantity: { gt: 0 } } } },
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-qu-blue">Upcoming events</h1>
      <ul className="space-y-3">
        {events.map((e) => {
          const available = e.listings.reduce((n, l) => n + l.quantity, 0);
          const min = e.listings.length ? Math.min(...e.listings.map((l) => l.priceCents)) : null;
          return (
            <li key={e.id}>
              <Link href={`/events/${e.id}`} className="block rounded-xl border border-slate-200 p-4 hover:border-qu-blue">
                <div className="font-semibold text-qu-blue">{e.title}</div>
                <div className="text-sm text-slate-600">
                  {e.venue} · {e.startsAt.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
                </div>
                <div className="mt-1 text-sm">
                  {available > 0 ? (
                    <span>{available} available · from {formatCad(min!)}</span>
                  ) : (
                    <span className="text-qu-red">No tickets listed</span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
