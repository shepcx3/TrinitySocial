# Queen's U Tix

A ticket marketplace exclusive to the Queen's University community. Students resell tickets they can't use; clubs and organizers list official inventory. Only verified @queensu.ca accounts can list or buy.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS
- Prisma + PostgreSQL
- better-auth (email + password, @queensu.ca gate, email verification)
- Zod for validation

## Local setup

```bash
npm install
cp .env.example .env          # set BETTER_AUTH_SECRET to a 32+ char random string
docker compose up -d          # or run a local Postgres and set DATABASE_URL
npx prisma migrate dev
npx prisma db seed            # sample Queen's events and listings
npm run dev
```

Open http://localhost:3000.

### Dev-only email verification bypass

`DEV_SKIP_EMAIL_VERIFICATION=true` marks new accounts as verified and skips sending verification emails. It must be off in production. With it off, verification emails are logged to the console by `ConsoleEmailSender` (`lib/email.ts`); swap in a real provider by calling `setEmailSender`.

## Architecture notes

- `lib/auth.ts` — better-auth config. Rejects non-@queensu.ca emails at the database hook layer, so the gate is enforced at the API, not just the UI.
- `lib/session.ts` — `requireVerifiedUser()` must guard every verified-only server action (create listing, buy).
- `lib/email.ts` — email sender interface.
- `lib/payments.ts` (planned) — `PaymentProvider` interface; a mock implementation for the simulated checkout, with Stripe to drop in later.
- `prisma/schema.prisma` — User, Session/Account/Verification (better-auth), Event, Listing, Order, Review, Report.

## Status

- [x] Scaffold, DB schema, seed data
- [x] Auth + @queensu.ca gate (with dev bypass)
- [ ] Event browse / search / filter
- [ ] Listing creation + seller dashboard
- [ ] Simulated checkout + QR tickets + My Tickets
- [ ] Reviews, reports, polish
