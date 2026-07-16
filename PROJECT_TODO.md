# OJT Tracker – Project To-Do & Roadmap

Last updated: 2026-07-16

## Summary
A Next.js 16 (App Router) + Prisma + PostgreSQL app for students to log OJT hours, view progress, and manage profile data. Authentication is implemented via Better Auth with real session-based security. All core features through Phase 7 are complete.

## Status Overview
- Framework: Next.js 16, React 19
- ORM: Prisma (client output to `src/generated/prisma`), 4 migrations tracked
- Auth: Better Auth ✅ (replaced hardcoded temp-user-1 placeholder)
- DB: PostgreSQL (local: `localhost:5432/ojt_tracker`)
- Route protection: `src/proxy.js` (cookie-presence check) + per-route `getSession()` calls
- IDOR protection: verified 2026-07-16 — 14/14 test checks passed

---

## Completed

### Infrastructure & Database
- [x] Database choice finalized: PostgreSQL
- [x] Prisma schema defined — User, Internship, LogEntry, ChecklistItem, Session, Account, Verification
- [x] 4 migrations tracked in `prisma/migrations/`
  - `20260304151416_init`
  - `20260306125014_internship_refactor`
  - `20260403061853_phase4_enum_and_indexes`
  - `20260716000000_add_better_auth` (captures Better Auth `db push` changes)
- [x] Prisma client singleton (`src/lib/prisma.js`)
- [x] `.env` with `DATABASE_URL` and `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`

### Authentication (Phase 7)
- [x] Better Auth installed and configured (`src/lib/auth.js`)
- [x] Sign-up page (`/register`) and login page (`/login`)
- [x] Session cookie set on sign-in; verified readable by proxy and route handlers
- [x] All `temp-user-1` hardcoded user IDs replaced with `session.user.id`
- [x] Route protection via `src/proxy.js` (Next.js 16 proxy, replaces middleware.js)
- [x] Password hashing via Better Auth (scrypt)

### Security Verification
- [x] IDOR test matrix (14 checks) run 2026-07-16 — all passed
  - Checks 1–9, 13–14: cross-user access returns 404 (no data leakage)
  - Checks 10–12: unauthenticated access returns 401

### Core App Features
- [x] Dashboard UI with hours progress bar, recent logs, quick stats
- [x] Optimistic UI updates on checklist interactions
- [x] Log entry form with client + server validation (Zod)
- [x] Profile page (company, start date, required hours)
- [x] Internship, log, and checklist CRUD APIs
- [x] Input validation via Zod on all API routes
- [x] Route-level `loading.js` and `error.js` for dashboard
- [x] Sign-out button (`/src/components/dashboard/SignOutButton.js`)

---

## Pending

### Deployment (next priority)
- [ ] Connect GitHub repo to Vercel for automatic deploys
- [ ] Set environment variables in Vercel dashboard:
  - `DATABASE_URL` (pooled connection string for production)
  - `DIRECT_URL` (direct connection for migrations)
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL` (production domain)
- [ ] Add `prisma generate` to `postinstall` script in `package.json`
- [ ] Run `prisma migrate deploy` as part of each production deploy (not `migrate dev`)
- [ ] Switch to managed PostgreSQL with connection pooling (Neon / Supabase / Vercel Postgres)

### Polish & Reliability
- [ ] `.env.example` file listing all required variable names (no secrets)
- [ ] Zod schema unit tests (high value, low effort — first testing target)
- [ ] Integration test for checklist update flow (core interactive feature)
- [ ] Pagination on log list if entry count grows large
- [ ] Empty-state UI when no internship or logs exist yet

---

## Recommended Patterns & Conventions
- Routing: App Router with nested `layout.js` and `page.js` per route segment
- Styling: Plain CSS / CSS Modules (`globals.css`, `*.module.css`)
- Data Access: Prisma client singleton; use server components where suitable
- API: Handlers under `app/api/*/route.js` — always call `auth.api.getSession()`, never trust client-provided user IDs
- Auth pattern: `const session = await auth.api.getSession({ headers: await headers() })` at the top of every protected route handler
- Paths: `@/*` alias per `jsconfig.json`

---

## Next Steps
1. Deploy to Vercel (Section 8 of ARCHITECTURE.md) — this turns the portfolio piece from "I built it" to "I shipped it"
2. Add `.env.example`
3. Write Zod schema tests
