import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { prisma } from "./db";
import { getEmailSender } from "./email";
import { isQueensEmail } from "./queens";

// DEV ONLY: lets you sign up and buy/sell without clicking a verification link.
// Never enable in production — it marks every new account as verified.
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
        text: `Welcome! Verify your @queensu.ca email to start buying and selling tickets:\n\n${url}`,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Enforced at the auth layer: only Queen's addresses can create accounts.
          if (!isQueensEmail(user.email)) {
            throw new APIError("BAD_REQUEST", {
              message: "Sign up with your @queensu.ca email address.",
            });
          }
          return { data: { ...user, emailVerified: devBypass } };
        },
      },
    },
  },
  user: {
    additionalFields: {
      faculty: { type: "string", required: false, input: true },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
