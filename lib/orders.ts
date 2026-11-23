import { randomBytes } from "crypto";
import { prisma } from "./db";

/**
 * e-Transfer only: the platform never holds funds. Flow:
 * PENDING_PAYMENT -> (buyer marks sent) PAYMENT_SENT -> (admin confirms) PAID
 * Tickets are reserved on creation and returned to the listing if cancelled.
 */

export const MAX_QTY_PER_ORDER = 10;

export function newTicketCode(): string {
  return "QTX-" + randomBytes(6).toString("hex").toUpperCase();
}

export async function reserveTickets(buyerId: string, listingId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ORDER) {
    throw new Error("INVALID_QUANTITY");
  }
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== "ACTIVE") throw new Error("NOT_AVAILABLE");
    if (listing.expiresAt < new Date()) throw new Error("EXPIRED");
    if (listing.sellerId === buyerId) throw new Error("OWN_LISTING");

    // Conditional decrement: fails atomically if stock ran out in the meantime.
    const res = await tx.listing.updateMany({
      where: { id: listingId, status: "ACTIVE", quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (res.count === 0) throw new Error("NOT_ENOUGH_TICKETS");
    await tx.listing.updateMany({
      where: { id: listingId, quantity: 0, status: "ACTIVE" },
      data: { status: "SOLD_OUT" },
    });

    return tx.order.create({
      data: {
        buyerId,
        listingId,
        quantity,
        totalCents: listing.priceCents * quantity,
        ticketCode: newTicketCode(),
      },
    });
  });
}

export async function markPaymentSent(buyerId: string, orderId: string) {
  const res = await prisma.order.updateMany({
    where: { id: orderId, buyerId, status: "PENDING_PAYMENT" },
    data: { status: "PAYMENT_SENT", paymentSentAt: new Date() },
  });
  if (res.count === 0) throw new Error("INVALID_STATE");
}

export async function cancelOrder(buyerId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== buyerId) throw new Error("NOT_FOUND");
    const res = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    });
    if (res.count === 0) throw new Error("INVALID_STATE");
    await tx.listing.update({
      where: { id: order.listingId },
      data: { quantity: { increment: order.quantity } },
    });
    await tx.listing.updateMany({
      where: { id: order.listingId, status: "SOLD_OUT" },
      data: { status: "ACTIVE" },
    });
  });
}

export async function confirmPayment(orderId: string) {
  const res = await prisma.order.updateMany({
    where: { id: orderId, status: "PAYMENT_SENT" },
    data: { status: "PAID", paidAt: new Date() },
  });
  if (res.count === 0) throw new Error("INVALID_STATE");
}
