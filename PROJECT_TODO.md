# OJT Tracker – Project To-Do & Roadmap

Last updated: 2026-08-02

## Summary
A Next.js 16 (App Router) + Prisma + PostgreSQL app for students to log OJT hours, view progress, and manage profile data. Authentication is implemented via Better Auth with real session-based security. Google OAuth (social login) and Resend email verification are live. All core features through Phase 8 are complete and the app is deployed to production.

## Status Overview
- Framework: Next.js 16, React 19
- ORM: Prisma (client output to `src/generated/prisma`), 7 migrations tracked
- Auth: Better Auth ✅ — email/password + Google OAuth + Resend email verification
- DB: PostgreSQL via Neon (pooled connection string in production); local Postgres for dev runtime
- Route protection: `src/proxy.js` (checks both `__Secure-` and plain cookie names) + per-route `getSession()` calls
- Trusted origins: `trustedOrigins` set in `auth.js` for localhost + production
- IDOR protection: verified 2026-07-16 — 14/14 test checks passed
- Character limits enforced: 2000 chars on journal content + log description (Zod + client), 200 chars on checklist title
- Double-submit protection: `useRef` synchronous guard on all 4 submission forms
- Production URL: https://intern-track-ojt-tracker.vercel.app ✅ Live

---

## Completed

### Infrastructure & Database
- [x] Database choice finalized: PostgreSQL
- [x] Prisma schema defined — User, Internship, LogEntry, ChecklistItem, JournalEntry, Session, Account, Verification
- [x] 7 migrations tracked in `prisma/migrations/`
  - `20260304151416_init`
  - `20260306125014_internship_refactor`
  - `20260403061853_phase4_enum_and_indexes`
  - `20260716000000_add_better_auth` (captures Better Auth `db push` changes)
  - `20260722075433_add_internship_archived`
  - `20260730000000_add_journal`
  - `20260801000000_add_rate_limit`
- [x] Local DB synced with production schema (2026-08-02) — `JournalEntry` + `rate_limit` applied
- [x] `.env.local` contains commented local `DIRECT_URL` — see comment for migration usage pattern
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

### Google OAuth + Email Verification (Phase 8 — commit 0651fd1)
- [x] Google OAuth social provider configured in `auth.js` (`socialProviders.google`)
  - [x] Google Cloud Console credentials wired via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - [x] Callback URLs registered: localhost + production
  - [x] "Continue with Google" button added to `/login` and `/register`
- [x] Resend email verification on new email/password registrations
  - [x] `requireEmailVerification: true` in `emailAndPassword` config
  - [x] `emailVerification.sendVerificationEmail` sends styled HTML email via Resend
  - [x] `RESEND_API_KEY` added to `.env` / `.env.example` / Vercel dashboard
  - [x] `/register` shows verification-pending state after signup
  - [x] `scripts/mark-existing-users-verified.sql` — one-time fix for pre-existing accounts
- [x] `trustedOrigins` added to `auth.js` for `localhost:3000`, `localhost:3001`, and production (fixes 11.2)

### UI Redesign (commits 4a24d61, 3c5dd53)
- [x] Deep neomorphism UI redesign applied across dashboard
- [x] Login and register pages rethemed to match app design system

### Security Verification
- [x] IDOR test matrix (14 checks) run 2026-07-16 — all passed
  - Checks 1–9, 13–14: cross-user access returns 404 (no data leakage)
  - Checks 10–12: unauthenticated access returns 401

### Core App Features
- [x] Dashboard UI with hours progress bar, recent logs, quick stats
- [x] Optimistic UI updates on checklist interactions
- [x] Log entry form with client + server validation (Zod)
- [x] Journal entry create / view / edit / delete
- [x] Profile page (company, start date, required hours)
- [x] Internship, log, checklist, and journal CRUD APIs
- [x] Input validation via Zod on all API routes
- [x] Route-level `loading.js` and `error.js` for dashboard
- [x] Sign-out button (`/src/components/dashboard/SignOutButton.js`)

### Reliability & Data Integrity (2026-08-02)
- [x] **Double-submit prevention** — `useRef` synchronous guard on all 4 forms (journal new, journal edit, log new, checklist add). Fixes race condition where `useState` re-render was too slow to block a second rapid click.
- [x] **Character limits** — server-side Zod `.max()` + client-side `maxLength` + visible `n/max` counter:
  - Journal content: 2,000 chars (`api/journal/route.js`, `api/journal/[id]/route.js`, `journal/new/page.js`, `journal/[id]/edit/page.js`)
  - Log description: 2,000 chars (`api/logs/route.js`, `api/logs/[id]/route.js`, `logs/new/page.js`)
  - Checklist title: 200 chars (`api/checklist/route.js`, `ChecklistCard.js`)
- [x] **Timezone fix — date storage** — date picker values were stored 8 hours off (`new Date("YYYY-MM-DD")` parsed as local midnight → wrong UTC). Fixed by appending `T00:00:00.000Z` to force true UTC midnight in all 3 create/edit forms. Fixes Activity Timeline showing dates one day early.
- [x] **Timezone fix — dashboard header** — `formatNowLabel()` now passes explicit `timeZone: "Asia/Manila"` so the displayed time is correct on Vercel (UTC runtime), not just locally.
- [x] **Timezone fix — `getTodayRange()`** — daily log detection uses `toLocaleDateString("en-CA", { timeZone: "Asia/Manila" })` to derive PH calendar date, then builds UTC midnight range. Correct on Vercel, not just local.
- [x] **Production duplicate cleanup** — found and deleted 1 duplicate `JournalEntry` in Neon (ID `cmsbdmni0000104jutser41ct`, created 3.5s after original via double-click). Cleanup script at `scripts/prod-check-duplicates.mjs`.

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
- [x] **11.2** — `trustedOrigins` now set in `auth.js` for localhost + production (fixed in commit 3c5dd53). Vercel preview-branch URLs still not listed — add them if preview testing becomes a regular workflow.

### Polish & Reliability
- [ ] Zod schema unit tests (high value, low effort — first testing target; schemas now have meaningful max-length constraints worth testing)
- [ ] Integration test for checklist update flow (core interactive feature)
- [ ] Pagination on log list if entry count grows large
- [ ] Resend sender address uses `onboarding@resend.dev` (test default). Update to a verified custom domain once one is configured.

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
3. Write Zod schema tests — character limit constraints are now meaningful bounds worth covering
4. Update Resend sender from `onboarding@resend.dev` to a verified custom domain (production polish)
5. Add Vercel preview-branch URLs to `trustedOrigins` if preview testing becomes part of the workflow

### Local migration workflow reminder
When applying migrations locally, `DIRECT_URL` must point at local Postgres (not Neon). See the comment in `.env.local` or use the one-liner:
```powershell
$env:DIRECT_URL = "postgresql://postgres:ayokomagisip@localhost:5432/ojt_tracker?schema=public"; npx prisma migrate deploy
```
