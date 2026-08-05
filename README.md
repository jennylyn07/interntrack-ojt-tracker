# InternTrack — OJT Tracker

> **Live demo:** [https://intern-track-ojt-tracker.vercel.app](https://intern-track-ojt-tracker.vercel.app)

InternTrack is a **full-stack web application** built for students to manage, track, and reflect on their On-the-Job Training (OJT) experience. It handles everything from logging daily work hours to writing private journal entries — backed by a real authentication system and a production PostgreSQL database.

---

## Table of Contents

1. [What It Does](#1-what-it-does)
2. [Tech Stack](#2-tech-stack)
3. [Features at a Glance](#3-features-at-a-glance)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Architecture Overview](#6-architecture-overview)
7. [Security Model](#7-security-model)
8. [Getting Started (Local Setup)](#8-getting-started-local-setup)
9. [Environment Variables](#9-environment-variables)
10. [Deployment](#10-deployment)
11. [Roadmap](#11-roadmap)

---

## 1. What It Does

Students doing OJT need to track hours, document what they worked on each day, and demonstrate their progress. InternTrack covers all of that in one place:

| Student need | How InternTrack handles it |
| :--- | :--- |
| Track hours toward required total | Progress bar with rendered vs. required hours |
| Log daily tasks | Daily log entry form with date, description, hours |
| Reflect on the experience | Private journal entries with mood tracking |
| Manage OJT requirements | Per-internship checklist with optimistic toggle |
| Switch between placements | Multi-internship switcher (for concurrent placements) |
| Manage internship history | Archive/restore, soft-delete with confirmation guard |
| Secure access | Email/password login, Google OAuth, email verification |

---

## 2. Tech Stack

```
Next.js 16 (App Router)   →   React 19   →   Plain CSS / CSS Modules
        ↓
Route Handlers (API)
        ↓
Better Auth (session management, Google OAuth, Resend email verification)
        ↓
Prisma ORM
        ↓
PostgreSQL (Neon in production, local Postgres in development)
```

| Technology | Version | Role |
| :--- | :--- | :--- |
| **Next.js** | 16.1.6 | Full-stack framework — App Router for pages and API routes |
| **React** | 19.2.3 | UI library |
| **Prisma** | 7.x | ORM — schema, migrations, type-safe queries |
| **PostgreSQL** | — | Relational database |
| **Better Auth** | 1.6.x | Authentication — sessions, Google OAuth, email verification |
| **Resend** | 6.x | Transactional email (email verification links) |
| **Zod** | 4.x | Runtime input validation on every API route |
| **Plain CSS** | — | Custom styling with CSS Modules; no Tailwind |

> **Why Better Auth instead of NextAuth/Auth.js?** Auth.js (formerly NextAuth) is in maintenance mode — security patches only. Its own maintainers now point new projects to Better Auth. Both are self-hosted (sessions in our own Postgres), so the architecture is identical; only the library managing the auth layer differs. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full reasoning.

---

## 3. Features at a Glance

### Dashboard
- **Progress card** — circular/bar progress of rendered vs. required OJT hours
- **Quick Actions** — one-click navigation to log a day, write a journal entry, or manage settings
- **Daily Log Card** — shows today's logged hours at a glance; links to the add-log form
- **Checklist Card** — per-internship requirements with optimistic-UI toggle (instant feedback, rollback on error)
- **Activity Timeline** — chronological feed of recent log entries and journal entries
- **Multi-internship Switcher** — `?internshipId=` URL param support for users with concurrent placements
- **Empty-state onboarding** — new users see a setup prompt instead of a zeroed-out dashboard

### Daily Log
- Create, view, and manage daily work entries
- Fields: date, task description (up to 2,000 characters), hours rendered
- Hours accumulate toward the internship's required-hours total

### Journal
- Private journal entries per internship
- Fields: date, title (optional), content (up to 2,000 characters), mood (Great / Good / Okay / Rough / Terrible)
- Full CRUD: create, read, edit, delete
- Entries scoped to the authenticated user — no cross-user access possible

### Checklist
- Per-internship checklist items (up to 200 characters per title)
- Optimistic toggle: checkbox changes instantly in the UI; rolls back silently if the API fails
- Create and delete items inline

### Internship Management
- Create multiple internship records (company, supervisor, required hours, start/end dates, status)
- Status enum: `PENDING` → `ACTIVE` → `COMPLETED` / `CANCELLED`
- **Archive** (soft-hide, reversible) and **delete** with a count-based confirmation modal guard

### Authentication
- **Email/password** registration with Resend email verification
- **Google OAuth** ("Continue with Google" on both register and login pages)
- Session-based — sessions stored in Postgres, not a third-party service
- Password hashing via scrypt (handled by Better Auth)
- Route protection via `src/proxy.js` + per-route `getSession()` calls
- Email verification gate on the dashboard server component (unverified accounts are blocked)

### Reliability Details
- **Double-submit prevention** — `useRef` synchronous guard on all 4 submission forms (journal new, journal edit, log new, checklist add). `useState` re-renders too slowly to block a second rapid click; `useRef` is synchronous and doesn't.
- **Character limits** — enforced at two layers: Zod `.max()` on the server, `maxLength` + live `n/max` counter on the client.
- **Timezone correctness** — date picker values stored as UTC midnight; all server-side formatters explicitly use `Asia/Manila` so times display correctly on Vercel's UTC runtime.
- **IDOR protection verified** — 14-check test matrix (cross-user + unauthenticated access): all 14 checks pass.

---

## 4. Project Structure

```
ojt-tracker/
├── prisma/
│   ├── migrations/          # SQL history — 7 migrations tracked
│   └── schema.prisma        # Single source of truth for the DB schema
│
├── scripts/                 # One-off utility scripts (duplicate check, user backfill)
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/[...all]/        # Better Auth catch-all handler
│   │   │   ├── checklist/            # Checklist CRUD (+ /[id])
│   │   │   ├── internships/          # Internship CRUD (+ /[id])
│   │   │   ├── journal/              # Journal CRUD (+ /[id])
│   │   │   └── logs/                 # Log entry CRUD (+ /[id])
│   │   │
│   │   ├── dashboard/
│   │   │   ├── internships/          # List, create (/new), edit (/[id]/edit)
│   │   │   ├── journal/              # Journal list, new entry, view/edit (/[id])
│   │   │   ├── logs/new/             # Add daily log form
│   │   │   ├── settings/             # User settings
│   │   │   ├── page.js               # Main dashboard (server component)
│   │   │   ├── layout.js             # Dashboard shell layout
│   │   │   ├── loading.js            # Suspense skeleton (shown while data fetches)
│   │   │   └── error.js              # Error boundary (shown if server component throws)
│   │   │
│   │   ├── login/                    # Sign-in page
│   │   ├── register/                 # Sign-up page
│   │   ├── globals.css               # Design system tokens + global styles
│   │   ├── layout.js                 # Root HTML shell
│   │   └── page.js                   # Root route → /dashboard or /login
│   │
│   ├── components/
│   │   ├── dashboard/                # ProgressCard, ChecklistCard, DailyLogCard,
│   │   │                             # ActivityTimeline, QuickActions, DashboardHeader,
│   │   │                             # InternshipSwitcher, InternshipList, JournalCard,
│   │   │                             # SignOutButton
│   │   └── ui/                       # Generic UI primitives (ThemeToggle)
│   │
│   ├── generated/                    # Prisma client output (gitignored, auto-rebuilt)
│   │
│   └── lib/
│       ├── auth.js                   # Better Auth server-side configuration
│       ├── auth-client.js            # Better Auth client hooks ("use client" components)
│       ├── dashboard-data.js         # Server-side data-fetching helpers
│       └── prisma.js                 # Prisma client singleton (HMR-safe)
│
├── src/proxy.js                      # Next.js 16 route protection (replaces middleware.js)
├── prisma.config.ts                  # Points prisma migrate at DIRECT_URL
├── .env.example                      # All required variable names with placeholders
├── ARCHITECTURE.md                   # Full technical writeup — data flow, security, decisions
└── PROJECT_TODO.md                   # Completed work log + pending items
```

---

## 5. Database Schema

Seven Prisma migrations are tracked in `prisma/migrations/`. The current schema:

| Model | Purpose |
| :--- | :--- |
| `User` | Registered accounts — email, name, avatar, `emailVerified` flag |
| `Internship` | One per placement — company, supervisor, required hours, status, archived flag |
| `LogEntry` | Daily work log — date, description, hours; belongs to one `Internship` |
| `JournalEntry` | Private reflection — date, title, content (2000 chars), mood enum; belongs to one `Internship` |
| `ChecklistItem` | Requirement item — title (200 chars), completed flag; belongs to one `Internship` |
| `Session` | Better Auth sessions stored in Postgres |
| `Account` | OAuth provider links (Google) |
| `Verification` | Email verification tokens |
| `RateLimit` | Better Auth database-backed rate limiting (per IP × endpoint) |

Key relationships:
- A `User` has many `Internship` records (one per placement, across time)
- Each `Internship` owns its `LogEntry`, `ChecklistItem`, and `JournalEntry` records
- All auth tables (`Session`, `Account`, `Verification`, `RateLimit`) are managed entirely by Better Auth

---

## 6. Architecture Overview

### Server vs. Client Components

Next.js App Router splits work between server and client:

- **Server components** (e.g., `dashboard/page.js`) run on the server. They fetch data directly from the database, have zero browser bundle cost, and render the initial HTML. Session checks also happen here.
- **Client components** (marked `"use client"`, e.g., `ChecklistCard.js`) run in the browser. They handle interactivity: checkbox toggles, form submissions, optimistic UI updates.

### Request Lifecycle (example: toggling a checklist item)

```
Student clicks checkbox
    → UI toggles instantly (optimistic update)
    → Browser: PUT /api/checklist/[id]  { completed: true }
        → proxy.js: session cookie present? → 401 if missing
        → Route handler: auth.api.getSession() → authoritative session
        → Zod: validates request body → 400 if invalid
        → Prisma: looks up item, verifies userId matches session → 404 if not owner
        → Prisma: updates row in Postgres
        → 200 OK
    → If error: UI rolls back the checkbox and shows a warning
```

### Prisma Client Singleton

`src/lib/prisma.js` caches the Prisma client in `globalThis` to survive Next.js Hot Module Replacement in development. Without this, every file save would open a new DB connection and exhaust Postgres's connection limit.

### Route Protection

Two-layer approach:
1. **`src/proxy.js`** (lightweight, fast): checks for the session cookie by name. Handles both `better-auth.session_token` (HTTP/dev) and `__Secure-better-auth.session_token` (HTTPS/production — Better Auth automatically uses the `__Secure-` prefix over HTTPS).
2. **Per-route `getSession()`** (authoritative): every API handler and protected server component calls `auth.api.getSession()` and reads `session.user.id` from the result. Client-provided user IDs are never trusted.

For the full technical deep-dive, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 7. Security Model

| Concern | How it's handled |
| :--- | :--- |
| **IDOR (Insecure Direct Object Reference)** | User ID always read from the server session, never from request body or query params. Verified: 14/14 cross-user and unauthenticated checks pass. |
| **Password storage** | scrypt hashing via Better Auth — passwords are never stored in plaintext |
| **Session security** | Sessions stored server-side in Postgres; signed tokens in HTTP-only cookies |
| **Email verification** | `requireEmailVerification: true`; unverified accounts are blocked at the dashboard server component level (not just the proxy) |
| **Input validation** | Zod schemas on every API route — type, format, and length are all validated before any database operation |
| **Double submission** | `useRef` synchronous guard on all 4 form components |
| **Rate limiting** | Better Auth database-backed rate limiting (per IP × endpoint via `RateLimit` table) |

---

## 8. Getting Started (Local Setup)

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** running locally, or a free hosted instance from [Neon](https://neon.tech) or [Supabase](https://supabase.com)

### 1. Clone and install

```bash
git clone https://github.com/jennylyn07/InternTrack-OJT-Tracker.git
cd InternTrack-OJT-Tracker/ojt-tracker
npm install
```

`prisma generate` runs automatically via the `postinstall` script.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values — see [Environment Variables](#9-environment-variables) for what each one does.

At minimum for local development you need:
- `DATABASE_URL` — your local Postgres connection string
- `BETTER_AUTH_SECRET` — any long random string
- `BETTER_AUTH_URL` — `http://localhost:3000`

Google OAuth and email verification (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`) are optional for local development — the app works without them; those features will simply be unavailable.

### 3. Set up the database

```bash
npx prisma migrate deploy
```

This applies all 7 tracked migrations to your local database. Do **not** use `migrate dev` against a shared or production database — `migrate deploy` is the safe, non-interactive command.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/register` to create your first account, or `/login` if you have one.

---

## 9. Environment Variables

All variable names with placeholder values are documented in [`.env.example`](./.env.example). Never commit your real `.env` — it is already covered by `.gitignore`.

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string used by the app at runtime. Use the **pooled** URL in production (Neon/Supabase provide one). |
| `DIRECT_URL` | ✅ (for migrations) | Non-pooled connection string used only by `prisma migrate`. Same as `DATABASE_URL` for local Postgres. |
| `BETTER_AUTH_SECRET` | ✅ | Signs and verifies session tokens. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | ✅ | Full base URL of the app, **including the scheme** — e.g. `http://localhost:3000` locally, `https://your-app.vercel.app` in production. The `https://` prefix is required for Better Auth to set `__Secure-` cookies correctly. |
| `GOOGLE_CLIENT_ID` | Optional | From Google Cloud Console → APIs & Services → Credentials. Enables "Continue with Google". |
| `GOOGLE_CLIENT_SECRET` | Optional | Paired with `GOOGLE_CLIENT_ID`. |
| `RESEND_API_KEY` | Optional | From [resend.com](https://resend.com). Enables email verification links on registration. |

> **Google OAuth callback URIs to register in Google Cloud Console:**
> - `http://localhost:3000/api/auth/callback/google` (development)
> - `https://your-app.vercel.app/api/auth/callback/google` (production)

---

## 10. Deployment

This app is live at **[https://intern-track-ojt-tracker.vercel.app](https://intern-track-ojt-tracker.vercel.app)** (deployed 2026-07-24).

### Deploying to Vercel

1. **Connect** your GitHub repo to Vercel — automatic deploys trigger on every push to `main`.
2. **Set environment variables** in Vercel → Project Settings → Environment Variables. All variables from Section 9 are required. `BETTER_AUTH_URL` must be the full `https://your-app.vercel.app` value.
3. **Use the Neon pooled connection string** for `DATABASE_URL` in production. Vercel runs serverless functions; each invocation can open a DB connection, so connection pooling is essential to avoid hitting Postgres's connection limit under traffic.
4. **Run migrations** against production manually after each schema change:
   ```bash
   npx prisma migrate deploy
   ```
   Vercel's build step does not run this automatically. A CI step to automate it is on the roadmap.
5. **`prisma generate`** is wired to the `postinstall` script in `package.json` — Vercel runs it automatically during the build.

### Known production gotchas (all fixed)

| Issue | Fix |
| :--- | :--- |
| `BETTER_AUTH_URL` missing `https://` caused silent session failures | Always include the full scheme |
| Proxy only checked the HTTP cookie name, not the `__Secure-` prefixed one used over HTTPS | `proxy.js` now checks both names |
| `router.refresh()` after login caused a race condition with session cookie timing | `router.refresh()` removed; `router.push()` to `/dashboard` is sufficient |
| `auth.js` had no explicit `baseURL`, causing unreliable cold-start session detection on Vercel | `baseURL: process.env.BETTER_AUTH_URL` added to the `betterAuth({})` config |

See [`ARCHITECTURE.md` Section 11](./ARCHITECTURE.md#11-known-issues--post-deployment-bugs-all-fixed-2026-07-24) for the full details on each.

---

## 11. Roadmap

### Pending

- [ ] Automate `prisma migrate deploy` as a Vercel CI step (currently manual per schema change)
- [ ] Confirm `DATABASE_URL` on Vercel points at the Neon **pooler** endpoint (connection pooling under traffic)
- [ ] Zod schema unit tests — character limit constraints are the highest-value first target
- [ ] Integration test for the checklist toggle flow (core interactive feature)
- [ ] Pagination on log and journal lists as entry counts grow
- [ ] Resend: update sender from `onboarding@resend.dev` to a verified custom domain
- [ ] Add Vercel preview-branch URLs to `trustedOrigins` in `auth.js` if preview testing becomes a regular workflow

### Architecture docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — full technical writeup: data flow, design decisions, security model, deployment, and post-deployment bug report
- [`PROJECT_TODO.md`](./PROJECT_TODO.md) — completed work log and remaining items