import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { getEmailSender } from "./email";

// DEV ONLY: marks new accounts as verified and skips verification emails.
// Never enable in production.
const devBypass = process.env.DEV_SKIP_EMAIL_VERIFICATION === "true";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: !devBypass,
  },
  emailVerification: {
    sendOnSignUp: !devBypass,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await getEmailSender().send({
        to: user.email,
        subject: "Verify your Queen's U Tix account",
        text: `Verify your email to start buying and selling tickets:\n\n${url}`,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, emailVerified: devBypass },
        }),
      },
    },
  },
  user: {
    additionalFields: {
      faculty: { type: "string", required: false, input: true },
      eTransferEmail: { type: "string", required: false, input: true },
      role: { type: "string", required: false, input: false },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
