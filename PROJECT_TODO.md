# OJT Tracker – Project To-Do & Roadmap

Last updated: 2026-02-05

## Summary
A Next.js (App Router) app for students to log OJT hours, view progress, and manage profile data, with authentication and a relational database via Prisma.

## Status Overview
- Framework: Next.js 16, React 19
- ORM: Prisma (client output to `src/generated/prisma`)
- Auth: next-auth (not configured)
- DB: Provider mismatch (README: MySQL; schema: PostgreSQL) – needs decision

---

## Prioritized To-Do List

- [High][In Progress] Requirements & Scope
  - Confirm database choice (MySQL vs PostgreSQL) and finalize initial scope (auth method, roles).
  - Why this matters: DB choice affects Prisma provider, connection string format, available features, and hosting options. Auth scope affects data model (e.g., roles) and API security.
  - What we’ll decide: One database (recommended: PostgreSQL for local via Docker or managed services; MySQL is also fine), credentials-based auth to start, optional admin role later.
  - Gotchas: Changing provider later requires migration rewrites; align `.env` early. NextAuth callback URLs must match environment.

- [High][Pending] Prisma Data Model
  - Define models and relations:
    - User (id, email unique, hashedPassword, createdAt)
    - StudentProfile (userId 1:1, requiredHours, company, startDate)
    - OjtLog (id, userId, date, hours, description, notes?, createdAt)
  - Add indexes for common queries (userId/date).
  - Purpose: Establish the schema that powers auth, profile, and log tracking.
  - Key concepts: One-to-one (User↔Profile) and one-to-many (User→Logs) relations; unique constraints (email); indices for performance on date and user filters.
  - Implementation: Define in `prisma/schema.prisma`, run `prisma migrate dev` to generate SQL and the client.
  - Gotchas: Use `Decimal` or `Int` for hours depending on granularity; ensure `date` is stored in a timezone-safe way (prefer `DateTime` with UTC).

- [High][Pending] Prisma Env/Provider
  - Align `datasource db` provider with chosen DB.
  - Ensure `DATABASE_URL` is set in `.env`; add `.env.example`.
  - Purpose: Make Prisma talk to the right DB with correct credentials.
  - Implementation: Update `provider = "postgresql" | "mysql"`; set `DATABASE_URL` like `postgresql://user:pass@host:port/db?schema=public` (PG) or `mysql://user:pass@host:port/db`.
  - Gotchas: Don’t commit real secrets; use `.gitignore` for `.env`. For Windows + OpenSSL issues with MySQL, ensure compatible client/SSL params.

- [Medium][Pending] Migrations & Seed
  - Create initial migration and generate Prisma client.
  - Seed script for one demo user and sample logs.
  - Purpose: Version your DB and have data to test the UI quickly.
  - Implementation: `npx prisma migrate dev --name init`; create `prisma/seed.(ts|js)` to insert user (bcrypt-hashed password), profile, and a few logs; run `prisma db seed`.
  - Gotchas: Seeding should be idempotent (check if user exists). Keep sample credentials safe and obvious (e.g., student@example.com / Passw0rd!).

- [Medium][Pending] Prisma Client Singleton
  - Add `src/lib/prisma.(ts|js)` to prevent hot-reload multiple instances.
  - Purpose: Avoid “Prisma has already been started” errors in dev due to Next.js HMR creating multiple clients.
  - Implementation: Use globalThis caching pattern to reuse the client in development.
  - Gotchas: Ensure the import path is reused consistently across API routes and server components.

- [High][Pending] Auth Setup (next-auth)
  - Prisma Adapter, Credentials provider (bcrypt), sessions.
  - Route: `app/api/auth/[...nextauth]/route.(ts|js)`.
  - Purpose: Secure routes and associate data with the logged-in user.
  - Implementation: Configure `NextAuth` with Prisma Adapter; add Credentials provider that verifies email/password via bcrypt.
  - UX: Add sign-in/sign-out UI and a `useSession()` guard for client components if needed.
  - Gotchas: Hash passwords with a strong salt rounds value (e.g., 10-12). Never log plaintext passwords. Set `NEXTAUTH_SECRET` in envs.

- [High][Pending] Logs API
  - Endpoints: create, list (date range), update, delete, summary (total/remaining hours).
  - Authorization: Only allow current user’s data.
  - Purpose: CRUD endpoints to manage OJT logs and compute progress.
  - Implementation: Route handlers under `app/api/logs/route.(ts|js)` and `app/api/logs/[id]/route.(ts|js)`; `app/api/logs/summary/route.(ts|js)` for aggregation.
  - Validation: Ensure `hours > 0`, `date` is valid, description length limits.
  - Gotchas: Prevent overposting (don’t trust client-sent `userId`); derive from session. Add pagination for list if needed.

- [Medium][Pending] Profile API
  - Get/update profile (company, startDate, requiredHours).
  - Purpose: Persist student’s OJT context to compute remaining hours.
  - Implementation: `app/api/profile/route.(ts|js)` supporting GET/PUT.
  - Gotchas: Validate `requiredHours` range; ensure `startDate` is a valid date; handle profile creation-on-first-update if not exists.

- [Medium][Pending] UI Shell & Route Guard
  - Global layout/navigation, protected dashboard layout, sign-in/out.
  - Purpose: Provide a consistent app frame and restrict access to authenticated users.
  - Implementation: Add a header with nav; server components check session; redirect unauthenticated users to sign-in.
  - Gotchas: Avoid client-only session checks for protected pages—prefer server-side checks in App Router for faster redirects.

- [Medium][Pending] Dashboard UI
  - Hours progress bar, recent logs, quick stats.
  - Purpose: Give students an at-a-glance view of their progress.
  - Implementation: Server component fetching summary + recent logs; simple progress bar (completed/required).
  - Gotchas: Handle division-by-zero if requiredHours unset; show onboarding empty states.

- [Medium][Pending] Log Entry UI
  - Form with client/server validation; use server actions or API fetch.
  - Purpose: Allow users to quickly add daily logs with accurate data.
  - Implementation: A form with date picker, hours (number), description, optional notes; submit to API; optimistic update optional.
  - Gotchas: Normalize dates (UTC vs local); prevent duplicate same-day entries if you choose that rule.

- [Low][Pending] Profile UI
  - Edit profile and persist via API.
  - Purpose: Capture required baseline info for accurate hour tracking.
  - Implementation: Form for company, start date, required hours; show validation messages and save state.
  - Gotchas: Surface when profile is incomplete and block dashboard calculations accordingly.

- [Medium][Pending] Validation & Error Handling
  - Centralize validation (zod or custom) and consistent API error patterns.
  - Purpose: Improve reliability and teachable errors for users.
  - Implementation: Shared validators in `src/lib/validation`; API handlers return consistent JSON structures and HTTP status codes.
  - Gotchas: Don’t leak internal error details; log server errors separately.

- [Low][Pending] Documentation
  - Update README: setup steps, env variables, DB choice, scripts.
  - Purpose: Keep the project self-explanatory for future you and collaborators.
  - Implementation: Add `.env.example`, local dev instructions, and auth/DB notes.
  - Gotchas: Ensure README matches the actual DB provider and routes.

- [Medium][Pending] Deployment
  - Prepare for Vercel: envs, NextAuth URLs, database hosting.
  - Purpose: Make the app runnable in production-like environments.
  - Implementation: Configure environment variables on Vercel; add `NEXTAUTH_URL`; connect to managed DB.
  - Gotchas: CORS and callback URL mismatches; set `NODE_ENV=production` builds locally to test.

---

## Clarifications Needed
- Database: Use MySQL (README) or PostgreSQL (current `schema.prisma`)?
- Auth: Credentials (email/password) only, or also OAuth providers? Any admin role needed now?
- Initial milestone to prioritize (models/migrations, auth, APIs/UI)?

---

## Recommended Patterns & Conventions
- Routing: App Router with nested `layout.js` and `page.js` per route segment.
- Styling: Plain CSS/CSS Modules (`globals.css`, `*.module.css`).
- Data Access: Prisma client singleton; use server components/actions where suitable.
- API: Handlers under `app/api/*/route.(ts|js)` with proper method handlers and auth checks.
- Paths: Use `@/*` alias per `jsconfig.json`.

---

## Next Steps (Proposed)
1) Decide DB provider and auth scope.  
2) Implement Prisma models and run first migration.  
3) Set up NextAuth with Prisma Adapter (Credentials + bcrypt).  
4) Build Logs/Profile APIs, then wire up dashboard and forms.  

Approve these steps and choices to proceed with implementation.
