import { prisma } from "@/lib/db";
import { formatCad } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";
import { adminConfirm } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role.toLowerCase() !== "admin") {
    return <main className="mx-auto max-w-2xl px-4 py-10"><p>Admins only.</p></main>;
  }
  const orders = await prisma.order.findMany({
    where: { status: "PAYMENT_SENT" },
    orderBy: { paymentSentAt: "asc" },
    include: { buyer: true, listing: { include: { event: true, seller: true } } },
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-qu-blue">Confirm e-Transfers</h1>
      <p className="mb-6 text-sm text-slate-600">Check your bank for each e-Transfer, then confirm. Match the memo to the ticket code.</p>
      {orders.length === 0 && <p>Nothing waiting.</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded-xl border border-slate-200 p-4">
            <div className="font-semibold">{o.listing.event.title}</div>
            <div className="text-sm text-slate-600">Buyer: {o.buyer.name} ({o.buyer.email})</div>
            <div className="text-sm text-slate-600">{o.quantity} × {o.listing.ticketType} · {formatCad(o.totalCents)} to {o.listing.seller.eTransferEmail ?? "seller"}</div>
            <div className="text-sm">Memo: <code className="font-mono font-bold">{o.ticketCode}</code></div>
            <form action={adminConfirm.bind(null, o.id)} className="mt-3">
              <button className="rounded-lg bg-qu-blue px-4 py-2 font-semibold text-white">Confirm payment received</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
