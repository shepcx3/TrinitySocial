import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatCad } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";
import { cancelMyOrder, markSent } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p>Log in to see your tickets. <Link href="/login" className="underline text-qu-blue">Log in</Link></p>
      </main>
    );
  }
  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: { include: { event: true, seller: true } } },
  });

  const withQr = await Promise.all(
    orders.map(async (o) => ({
      ...o,
      qr: o.status === "PAID" ? await QRCode.toDataURL(o.ticketCode, { margin: 1, width: 220 }) : null,
    })),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-qu-blue">My tickets</h1>
      {withQr.length === 0 && <p className="text-slate-600">No orders yet.</p>}
      <ul className="space-y-4">
        {withQr.map((o) => (
          <li key={o.id} className="rounded-xl border border-slate-200 p-4">
            <div className="font-semibold text-qu-blue">{o.listing.event.title}</div>
            <div className="text-sm text-slate-600">
              {o.quantity} × {o.listing.ticketType} · {formatCad(o.totalCents)} total
            </div>

            {o.status === "PENDING_PAYMENT" && (
              <div className="mt-3 space-y-2 rounded-lg bg-qu-gold/20 p-3 text-sm">
                <p>Send <strong>{formatCad(o.totalCents)}</strong> by e-Transfer to <strong>{o.listing.seller.eTransferEmail ?? "the seller (contact on request)"}</strong>.</p>
                <p>Message / memo: <code className="font-mono font-bold">{o.ticketCode}</code></p>
                <div className="flex gap-2">
                  <form action={markSent.bind(null, o.id)}><button className="rounded-lg bg-qu-blue px-3 py-1.5 font-semibold text-white">I've sent it</button></form>
                  <form action={cancelMyOrder.bind(null, o.id)}><button className="rounded-lg border border-slate-300 px-3 py-1.5">Cancel</button></form>
                </div>
              </div>
            )}
            {o.status === "PAYMENT_SENT" && <p className="mt-3 text-sm text-slate-700">Payment sent. Waiting for an admin to confirm it.</p>}
            {o.status === "PAID" && o.qr && (
              <div className="mt-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.qr} alt={`QR code ${o.ticketCode}`} width={160} height={160} />
                <div className="text-sm">
                  <div>Ticket code</div>
                  <code className="font-mono font-bold">{o.ticketCode}</code>
                </div>
              </div>
            )}
            {o.status === "CANCELLED" && <p className="mt-3 text-sm text-slate-500">Cancelled.</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
