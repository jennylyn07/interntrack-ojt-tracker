# OJT Tracker – Project To-Do & Roadmap

Last updated: 2026-07-24

## Summary
A Next.js 16 (App Router) + Prisma + PostgreSQL app for students to log OJT hours, view progress, and manage profile data. Authentication is implemented via Better Auth with real session-based security. All core features through Phase 7 are complete and the app is deployed to production.

## Status Overview
- Framework: Next.js 16, React 19
- ORM: Prisma (client output to `src/generated/prisma`), 4 migrations tracked
- Auth: Better Auth ✅ (replaced hardcoded temp-user-1 placeholder)
- DB: PostgreSQL via Neon (pooled connection string in production)
- Route protection: `src/proxy.js` (checks both `__Secure-` and plain cookie names) + per-route `getSession()` calls
- IDOR protection: verified 2026-07-16 — 14/14 test checks passed
- Production URL: https://intern-track-ojt-tracker.vercel.app ✅ Live

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
- [x] `.env.example` committed with all required variable names

### Authentication (Phase 7)
- [x] Better Auth installed and configured (`src/lib/auth.js`)
  - [x] Explicit `baseURL: process.env.BETTER_AUTH_URL` set (fixes silent cold-start detection failures on Vercel)
- [x] Sign-up page (`/register`) and login page (`/login`)
  - [x] `router.refresh()` removed from login success handler (was causing a race condition with the session cookie)
- [x] Session cookie set on sign-in; verified readable by proxy and route handlers
- [x] All `temp-user-1` hardcoded user IDs replaced with `session.user.id`
- [x] Route protection via `src/proxy.js` (Next.js 16 proxy, replaces middleware.js)
  - [x] Proxy checks both `__Secure-better-auth.session_token` (HTTPS/production) and `better-auth.session_token` (HTTP/dev)
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

### Deployment
- [x] GitHub repo connected to Vercel — automatic deploys on push to `main`
- [x] Environment variables set in Vercel dashboard:
  - `DATABASE_URL` (Neon pooled connection string)
  - `DIRECT_URL` (Neon direct connection for migrations)
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL` = `https://intern-track-ojt-tracker.vercel.app` (must include `https://`)
- [x] `prisma generate` wired to `postinstall` in `package.json`
- [x] Production DB on Neon with pooled connection string

---

## Pending

### Production Reliability
- [ ] Run `prisma migrate deploy` as a CI step on each deploy (currently manual per schema change)
- [ ] Switch `DATABASE_URL` to the Neon **pooler** hostname (`ep-...-pooler.ap-southeast-1...`) for proper connection pooling under traffic — see ARCHITECTURE.md Section 4B

### Known Minor Gaps (see ARCHITECTURE.md Section 11)
- [ ] **11.2** — Better Auth rejects Vercel preview-branch URLs (`Invalid origin` error). Fix: add preview URL to `trustedOrigins` in `auth.js`. Low priority until preview testing is a regular workflow.

### Polish & Reliability
- [ ] Zod schema unit tests (high value, low effort — first testing target)
- [ ] Integration test for checklist update flow (core interactive feature)
- [ ] Pagination on log list if entry count grows large

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
1. Add `prisma migrate deploy` to CI/CD pipeline so schema changes deploy automatically
2. Confirm `DATABASE_URL` on Vercel points to the Neon **pooler** endpoint (Section 4B)
3. Write Zod schema tests
