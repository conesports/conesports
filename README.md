# ConeSports

Single-vendor e-commerce storefront (Next.js App Router). Phase 0: scaffold + auth only.

## Stack

- Next.js (App Router, TypeScript, Tailwind)
- Prisma + PostgreSQL (Supabase)
- Auth.js (NextAuth v5) — Credentials + Google OAuth
- Resend / Supabase Storage installed for later phases

## Setup

```bash
cd storefront
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — Supabase **transaction pooler** (`:6543`, `pgbouncer=true`, `connection_limit=1`)
- `DIRECT_URL` — session/direct connection (`:5432`) for migrations
- `AUTH_SECRET` / `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` for the admin seed
- `PAYSTACK_SECRET_KEY` (or set it in Admin → Settings)
- `SUPABASE_SERVICE_ROLE_KEY` for product image uploads

```bash
npm install
npx prisma migrate dev
npm run db:seed-admin
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Customer signup: `/register`
- Customer login: `/login` → `/account`
- Admin login: `/admin/login` (non-admin credentials are rejected)
- Prisma Studio: `npm run db:studio`

`/admin/*` (except login) requires `session.user.isAdmin`. `/account/*` requires a session.
