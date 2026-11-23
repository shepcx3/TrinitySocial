# Queen's U Tix

A ticket marketplace for Queen's events. Students resell tickets they can't use; clubs and organizers list official inventory. Payments are **e-Transfer only**: the platform never holds funds.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS
- Prisma + PostgreSQL
- better-auth (email + password, email verification)
- Zod for validation

## Local setup

```bash
npm install
cp .env.example .env          # set BETTER_AUTH_SECRET to a 32+ char random string
docker compose up -d          # or run a local Postgres and set DATABASE_URL
npx prisma migrate dev
npx prisma db seed            # sample events and listings
npm run dev
```

Open http://localhost:3000.

### Dev-only email verification bypass

`DEV_SKIP_EMAIL_VERIFICATION=true` marks new accounts as verified and skips sending verification emails. It must be off in production. With it off, verification emails are logged to the console by `ConsoleEmailSender` (`lib/email.ts`); swap in a real provider by calling `setEmailSender`.

## Admins

Admins confirm e-Transfer payments at `/admin/payments`. Sign up first, then promote the account:

```bash
npm run make-admin -- you@example.com
```

## Payment flow (e-Transfer only)

1. Buyer reserves tickets. Stock is held on the order.
2. Buyer sends an e-Transfer to the seller's `eTransferEmail`, using the order's `ticketCode` as the memo, then clicks "I've sent it".
3. An admin checks the bank and confirms at `/admin/payments`. The order becomes `PAID` and the QR ticket appears under My Tickets.
4. Buyers can cancel while `PENDING_PAYMENT`, which returns the stock.

## Architecture notes

- `lib/auth.ts` — better-auth config (email + password, verification).
- `lib/session.ts` — `requireVerifiedUser()` must guard every verified-only server action (create listing, buy).
- `lib/orders.ts` — reserve / mark sent / cancel / admin confirm. Stock changes are atomic.
- `lib/email.ts` — email sender interface.
- `prisma/schema.prisma` — User, Session/Account/Verification (better-auth), Event, Listing, Order, Review, Report.

## Status

- [x] Scaffold, DB schema, seed data
- [x] Auth (with dev verification bypass)
- [ ] Event browse / search / filter
- [ ] Listing creation + seller dashboard
- [x] e-Transfer checkout (reserve → mark sent → admin confirms) + QR tickets + My Tickets
- [ ] Seller dashboard (listing create/edit, sales view)
- [ ] Reviews, reports, polish
