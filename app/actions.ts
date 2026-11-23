"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireVerifiedUser } from "@/lib/session";
import { cancelOrder, confirmPayment, markPaymentSent, reserveTickets } from "@/lib/orders";

export async function buyTickets(formData: FormData) {
  const user = await requireVerifiedUser();
  const listingId = String(formData.get("listingId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  await reserveTickets(user.id, listingId, quantity);
  revalidatePath("/tickets");
  revalidatePath(`/events`);
}

export async function markSent(orderId: string) {
  const user = await requireVerifiedUser();
  await markPaymentSent(user.id, orderId);
  revalidatePath("/tickets");
}

export async function cancelMyOrder(orderId: string) {
  const user = await requireVerifiedUser();
  await cancelOrder(user.id, orderId);
  revalidatePath("/tickets");
  revalidatePath("/events");
}

export async function adminConfirm(orderId: string) {
  await requireAdmin();
  await confirmPayment(orderId);
  revalidatePath("/admin/payments");
  revalidatePath("/tickets");
}
