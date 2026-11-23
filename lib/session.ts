import { headers } from "next/headers";
import { auth } from "./auth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  faculty: string | null;
  eTransferEmail: string | null;
  role: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const u = result.user as CurrentUser & Record<string, unknown>;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: Boolean(u.emailVerified),
    faculty: (u.faculty as string | null) ?? null,
    eTransferEmail: (u.eTransferEmail as string | null) ?? null,
    role: (u.role as string) ?? "user",
  };
}

/**
 * Gate for verified-only actions (create listing, buy). Call this in every
 * server action / route handler — never rely on the UI alone.
 */
export async function requireVerifiedUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!user.emailVerified) throw new Error("UNVERIFIED");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireVerifiedUser();
  if (user.role !== "admin" && user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
