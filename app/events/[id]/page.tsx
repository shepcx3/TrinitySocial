import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCad } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";
import { MAX_QTY_PER_ORDER } from "@/lib/orders";
import { buyTickets } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, user] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { listings: { where: { status: "ACTIVE", quantity: { gt: 0 } }, include: { seller: true }, orderBy: { priceCents: "asc" } } },
    }),
    getCurrentUser(),
  ]);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/events" className="text-sm text-qu-blue underline">← All events</Link>
      <h1 className="mt-3 text-3xl font-extrabold text-qu-blue">{event.title}</h1>
      <p className="text-slate-600">
        {event.venue} · {event.startsAt.toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" })}
      </p>
      <p className="mt-4 text-slate-700">{event.description}</p>

      <h2 className="mt-8 mb-3 text-xl font-bold text-qu-blue">Tickets</h2>
      {event.listings.length === 0 && <p className="text-slate-600">No tickets listed right now.</p>}
      <ul className="space-y-3">
        {event.listings.map((l) => (
          <li key={l.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{formatCad(l.priceCents)} each · {l.ticketType}{l.section ? ` · Sec ${l.section}` : ""}{l.row ? ` Row ${l.row}` : ""}{l.seat ? ` Seat ${l.seat}` : ""}</div>
                <div className="text-sm text-slate-600">{l.quantity} available · seller {l.seller.name}</div>
                {l.notes && <div className="text-sm text-slate-500">{l.notes}</div>}
              </div>
              {user && user.id !== l.sellerId ? (
                <form action={buyTickets} className="flex items-center gap-2">
                  <input type="hidden" name="listingId" value={l.id} />
                  <select name="quantity" className="rounded-lg border border-slate-300 px-2 py-2">
                    {Array.from({ length: Math.min(l.quantity, MAX_QTY_PER_ORDER) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-qu-blue px-4 py-2 font-semibold text-white">Reserve</button>
                </form>
              ) : !user ? (
                <Link href="/login" className="rounded-lg bg-qu-blue px-4 py-2 font-semibold text-white">Log in to buy</Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-slate-500">Payment is by e-Transfer. After you reserve, send the e-Transfer and an admin will confirm it.</p>
    </main>
  );
}
