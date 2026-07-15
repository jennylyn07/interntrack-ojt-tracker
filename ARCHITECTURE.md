# Project Architecture & Tech Stack: InternTrack OJT Tracker

> **Revision notes:** This is an updated version of the original architecture doc. What changed: swapped Auth.js/NextAuth.js for Better Auth (reasoning below), added production-grade database connection handling — the original singleton pattern only solved the *development* problem, not the production one — added a transparent "current status" section so nothing here reads as a claim about code that doesn't exist yet, and added four sections the original didn't cover: environment variables, testing strategy, deployment, and error/loading states.

Welcome! If you are preparing for a career in software engineering, this project is built using the same **architectural patterns, frameworks, and tools** that modern tech companies use.

This document breaks down how the OJT Tracker is structured, how data flows through it, and why these choices align with professional industry standards — and just as importantly, it's explicit about what's actually running today versus what's designed but not yet built. A doc that blurs that line reads as inflated the moment someone opens the repo; this one doesn't.

---

## Table of Contents
0. [Current Implementation Status](#0-current-implementation-status)
1. [The Core Tech Stack](#1-the-core-tech-stack)
2. [Directory Layout & Key Files](#2-directory-layout--key-files)
3. [Data Flow: How a Request Travels](#3-data-flow-how-a-request-travels)
4. [Key Design Patterns & Technical Decisions](#4-key-design-patterns--technical-decisions)
5. [Environment Variables & Secrets Management](#5-environment-variables--secrets-management)
6. [Security Practices Applied](#6-security-practices-applied)
7. [Testing Strategy (Planned)](#7-testing-strategy-planned)
8. [Deployment](#8-deployment)
9. [Error Handling & Loading States](#9-error-handling--loading-states)
10. [Roadmap: What Phase 7 Actually Unlocks](#10-roadmap-what-phase-7-actually-unlocks)

---

## 0. Current Implementation Status

Before anything else — here's what's actually running today versus what's designed but not yet built. Keep this table current as you go. It's worth more to an interviewer than a document that only describes a finished target state, because it shows you know the difference.

| Feature | Status |
| :--- | :--- |
| Dashboard UI, checklist tracking, progress cards | ✅ Built |
| Optimistic UI updates | ✅ Built |
| Input validation with Zod | ✅ Built |
| Database schema & Prisma migrations | ✅ Built |
| Development-safe database connections (singleton) | ✅ Built |
| Authentication (Better Auth) | 🔜 Planned — Phase 7 |
| Session-based IDOR protection | 🔜 Planned — depends on Phase 7 |
| Password hashing | 🔜 Planned — depends on Phase 7 |
| Production-safe connection pooling | 🔜 Planned — see Section 4B |
| Deployment | 🔜 Planned — see Section 8 |

Anywhere below that describes security or auth behavior is describing the **target design**, not a claim about what's live right now. Each one is flagged again where it matters.

---

## 1. The Core Tech Stack

```mermaid
graph TD
    A["Frontend (React 19 / Next.js 16)"] -->|HTTP Request| B["Next.js Route Handlers (APIs)"]
    B -->|Prisma Client| C["Prisma ORM"]
    C -->|SQL Queries| D["PostgreSQL Database"]
    E["Better Auth (Auth Layer)"] <---> B
```

| Technology | Role | Why It's Chosen (Industry Perspective) |
| :--- | :--- | :--- |
| **Next.js (App Router)** | Framework | Next.js is the industry standard for React development. The **App Router** allows us to write both frontend pages and backend APIs in a single repository (monorepo structure), simplifying deployment and code sharing. |
| **React 19** | UI Library | React is the most widely-used frontend library in the world. Learning React and its state-management paradigms is one of the most bankable skills in modern web development. |
| **Prisma ORM** | Object-Relational Mapper | Prisma abstracts away complex SQL queries. Instead of writing raw SQL strings, you write code in type-safe TypeScript/JavaScript. It makes database changes easily trackable via migrations. |
| **PostgreSQL** | Database | Postgres is a robust, production-grade relational database. It is highly reliable, scales exceptionally well, and is preferred by companies of all sizes over simpler database solutions. |
| **Better Auth** | Authentication | Setting up secure login systems from scratch is error-prone, so a dedicated library is the right call either way. See the note below for why this project uses Better Auth specifically, rather than the more commonly-tutorialized NextAuth.js. |

> **Why Better Auth instead of NextAuth.js / Auth.js?** NextAuth.js renamed to Auth.js as it expanded beyond Next.js, and as of this writing it's in maintenance mode — security patches only, no new feature development, and its own maintainers now point new projects toward Better Auth instead. Better Auth is self-hosted the same way Auth.js is (sessions live in our own Postgres database, not a third party's), so nothing about the architecture diagram above changes — only the library managing the auth layer does. If this project already had a working Auth.js setup, switching wouldn't be worth the churn; starting fresh, Better Auth is the better default.

---

## 2. Directory Layout & Key Files

Here is how the project files are organized and what each directory is responsible for:

```text
ojt-tracker/
├── .env.example                 # Template listing required env vars, no real secrets (see Section 5)
├── prisma/                      # Database Schema & Migration files
│   ├── migrations/              # SQL history tracking every database change
│   └── schema.prisma            # The single source of truth for the database design
│
├── src/
│   ├── app/                     # Next.js App Router (pages and APIs)
│   │   ├── api/                 # Backend API endpoints (e.g. /api/logs, /api/checklist)
│   │   ├── dashboard/           # The student dashboard UI pages
│   │   │   ├── loading.js       # Route-level loading UI (see Section 9)
│   │   │   └── error.js         # Route-level error boundary (see Section 9)
│   │   ├── globals.css          # Global CSS stylesheet (contains design system tokens)
│   │   ├── layout.js            # Root layout wrapping the HTML shell
│   │   └── page.js              # Main home page (redirects to dashboard)
│   │
│   ├── components/              # Reusable UI components
│   │   ├── dashboard/           # Dashboard-specific components (e.g., ProgressCard, ChecklistCard)
│   │   └── ui/                  # Core generic UI components (e.g., ThemeToggle)
│   │
│   ├── generated/                # Automatically generated database client files by Prisma
│   │
│   └── lib/                      # Shared utility files
│       ├── prisma.js             # Database connection manager (Singleton — see Section 4B)
│       ├── auth.js               # Better Auth configuration (Phase 7 — not yet present)
│       └── dashboard-data.js     # Server-side data-fetching helpers
```

---

## 3. Data Flow: How a Request Travels

Let's trace how the application handles an action, like a student checking off an internship requirement on their checklist:

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Browser (React Component)
    participant API as Next.js API Route (/api/checklist/[id])
    participant DB as PostgreSQL (via Prisma)

    Student->>UI: Clicks checkbox on Checklist item
    Note over UI: Optimistic Update:<br/>UI toggles checkbox immediately<br/>before waiting for network response.
    UI->>API: Fetch PUT /api/checklist/item-id { completed: true }
    API->>API: Validate input format with Zod schema
    API->>API: Verify session ownership (IDOR check — Phase 7, not yet live)
    API->>DB: prisma.checklistItem.update()
    DB-->>API: Returns updated database record
    API-->>UI: Response: 200 OK (or error)
    Note over UI: If error occurs,<br/>UI reverts checkmark state<br/>and displays warning toast.
```

### Architectural Details:
1. **Optimistic Updates (Browser)**: In [ChecklistCard.js](file:///c:/Users/Welcome/Documents/GitHub/InternTrack-OJT-Tracker/ojt-tracker/src/components/dashboard/ChecklistCard.js#L25-L66), when a user checks an item, the checkbox toggles *instantly*. If the API fails later, it rolls back. This mimics premium apps (like Facebook likes or Twitter retweets) where the interface feels snappy.
2. **Input Validation (Backend)**: Before doing database operations, APIs use a library called **Zod** (e.g., in [logs/route.js](file:///c:/Users/Welcome/Documents/GitHub/InternTrack-OJT-Tracker/ojt-tracker/src/app/api/logs/route.js#L13-L18)) to validate that dates are real dates, hours are positive numbers, etc. This blocks corrupted inputs — and unlike the IDOR check above, this piece is fully live today, not just designed.
3. **Database Client (ORM)**: Prisma generates a type-safe client in the `src/generated` directory. This acts as a bridge so we interact with database tables as standard JavaScript objects.

---

## 4. Key Design Patterns & Technical Decisions

### A. Server Components vs. Client Components (Next.js Hybrid Architecture)
Next.js separates components based on where they run:
- **Server Components** (default, like [dashboard/page.js](file:///c:/Users/Welcome/Documents/GitHub/InternTrack-OJT-Tracker/ojt-tracker/src/app/dashboard/page.js)): They run on the server. They can query databases directly, have zero impact on browser bundle size, and render pages faster.
- **Client Components** (marked with `"use client"`, like [ChecklistCard.js](file:///c:/Users/Welcome/Documents/GitHub/InternTrack-OJT-Tracker/ojt-tracker/src/components/dashboard/ChecklistCard.js)): They run in the browser. They can listen to user interactions (clicks, keyboard events) and keep track of local state (toggles, input fields).

**Why this is industry-standard:** Mixing these two yields fast initial load times (good for SEO and slow mobile networks) while preserving interactivity.

### B. Database Connection Management

This is actually two separate problems with two separate fixes — the original version of this doc only covered the first one.

#### B.1 — The Development Problem: Hot Module Replacement (Solved)

During development, Next.js performs **Hot Module Replacement (HMR)** to reload files as you edit code. If we just wrote `const prisma = new PrismaClient()` directly, every file save would instantiate a new database client. Eventually, you would exhaust PostgreSQL's max connection limit, crashing the server.

In [src/lib/prisma.js](file:///c:/Users/Welcome/Documents/GitHub/InternTrack-OJT-Tracker/ojt-tracker/src/lib/prisma.js), we cache the Prisma instance in a global object (`globalThis`):
```javascript
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient(...);
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```
This is the standard fix for the HMR problem specifically, and it's already implemented in this project.

#### B.2 — The Production Problem: Serverless Connection Exhaustion (Planned)

The singleton above solves duplicate clients from hot-reloading in development — it does **not**, on its own, solve a different problem that only shows up in production. When this app deploys to a serverless platform like Vercel, each API request can spin up its own short-lived function instance, and each instance can open its own database connection. Under real traffic, dozens or hundreds of these can run concurrently, and Postgres has a hard ceiling on total connections (100 is a common default). A handful of connections locally is fine; a traffic spike spread across many serverless invocations is how "too many connections" errors happen in production, even when the singleton pattern is correctly in place — these are genuinely separate problems and need separate fixes.

The practical fix for a project this size: use a managed Postgres provider with built-in connection pooling — Neon, Supabase, and Vercel's own Postgres offering all support this. In practice this usually means two connection strings instead of one:
- `DATABASE_URL` — a **pooled** connection string, used by the running app
- `DIRECT_URL` — a **direct** connection string, used only when running migrations

This is a configuration change, not a code change — the singleton pattern in B.1 stays exactly as-is either way.

### C. Database Migrations (Schema Version Control)
Instead of manually opening database management apps to create tables, we use Prisma migrations. When the schema changes, Prisma records the changes in SQL files under `prisma/migrations`.

One command distinction worth internalizing before Section 8 (Deployment): `prisma migrate dev` is for local development — it's interactive, and in some conflict scenarios it can reset data. `prisma migrate deploy` is the production-safe counterpart — non-interactive, and it only applies pending migrations without prompting or resetting anything. The deployment pipeline should only ever run `migrate deploy`.

**Why this is industry-standard:** This works like Git, but for your database structure. Multiple developers working on the same project can synchronize their databases instantly by running `npx prisma migrate dev` locally, while production stays on the safer `migrate deploy` path.

---

## 5. Environment Variables & Secrets Management

None of the secrets this app needs — database credentials, the auth secret key, OAuth client IDs — should ever be committed to the repository. The convention:

- **`.env`** — holds real values locally. Gitignored, never pushed.
- **`.env.example`** — committed to the repo, lists every variable name the app needs with placeholder or blank values, so anyone (a future you, or an interviewer cloning the repo) knows what to configure without ever seeing a real secret.

For this project, that list currently includes (or will include, once Phase 7 lands):

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | Pooled connection string the running app uses (Section 4B) |
| `DIRECT_URL` | Direct connection string used only for migrations (Section 4B) |
| Better Auth secret key | Signs and encrypts session data — exact variable name depends on the version installed; check current Better Auth docs |
| OAuth client ID / secret (optional) | Only needed if adding Google/GitHub login |

In production, these live in the hosting platform's dashboard (for Vercel: Project Settings → Environment Variables) — not in a file at all.

---

## 6. Security Practices Applied

> **Status check:** Everything below describes the *target* security model once Phase 7 lands. As of this writing, the codebase uses hardcoded placeholder IDs (`temp-user-1`) instead of real sessions, so none of this is enforced in the running app yet. This is the spec being built toward, not a claim about the current state — see Section 0.

Actual industries evaluate backend code on how it handles security. This project is designed to enforce:

1. **No Trusted Client Inputs (IDOR Protection)**:
   A common security vulnerability is *Insecure Direct Object Reference*. For example, a user logs in and tries to fetch their logs, but they manually change the query from `/api/logs?userId=1` to `/api/logs?userId=2` to view someone else's logs.
   *Resolution:* We do not rely on user IDs sent from the client-side browser. Instead, our backend APIs read the user ID directly from the secure, encrypted **server session** using Better Auth.
2. **Password Security**:
   In Phase 7, we will stop using plain text passwords. Better Auth's default hashing algorithm is scrypt; bcrypt is also a fine, industry-normal choice if standardizing on that instead is preferred. Either way, if the database is ever leaked, passwords remain unreadable.

---

## 7. Testing Strategy (Planned)

This project doesn't need a full test pyramid to make a strong impression — a small number of well-chosen tests, and the ability to explain *why* those specific ones were chosen, signals more engineering judgment than either no tests at all or an over-tested todo app. A realistic, proportional plan:

- **Zod schema tests** — cheap to write, and they directly protect the one thing every API route depends on: valid input. Good first target.
- **One or two integration tests for the checklist update flow** — this is the core interactive feature from Section 3, so it's the highest-value thing to protect against regressions.
- **Skip UI snapshot testing for now** — it adds maintenance overhead disproportionate to what it catches at this project's size.

Vitest or Jest are both reasonable choices for a Next.js project; either is fine to name in an interview as "what I'd reach for," even before every test is actually written.

---

## 8. Deployment

Given the stack, Vercel is the natural fit — it's built by the same team as Next.js and is the default target most Next.js tutorials and docs assume.

The pieces that need to be in place before "it's deployed" is actually true:

1. **Connect the GitHub repo to Vercel** — this gets automatic deploys on every push to the main branch.
2. **Set every variable from Section 5** in the Vercel dashboard — the app will fail to build or run without them.
3. **Make sure `prisma generate` runs on every build** — usually wired into a `postinstall` script — so the generated client (Section 2) always matches the current schema.
4. **Run `prisma migrate deploy` against the production database** before or as part of each deploy — Vercel's build step does not do this automatically, so it has to be added deliberately (a CI step, or a manual command run once per schema change).
5. **Point production `DATABASE_URL` at the pooled connection string** from Section 4B, not the direct one.

This is the section that turns "I built something" into "I shipped something" — a live URL is the actual deliverable for a portfolio, more than any of the code underneath it.

---

## 9. Error Handling & Loading States

Section 3 covers what happens when *one interactive element* (a checkbox) fails — the optimistic update rolls back. This section covers the other case: what happens when an entire page fails to load, e.g. the database is unreachable.

Next.js App Router gives this for free at the route level, through two special files:
- **`loading.js`** — shown automatically while a server component's data is being fetched, so the user sees something other than a blank screen.
- **`error.js`** — a client-side error boundary shown if a server component throws, so a broken page shows a recoverable message instead of a blank crash.

Both are cheap to add (see Section 2 for where they'd live under `dashboard/`), and they're the kind of small detail that reads as "this person has actually used Next.js in practice" rather than "this person followed a tutorial."

---

## 10. Roadmap: What Phase 7 Actually Unlocks

Phase 7 isn't cleanup tacked onto the end of this project — it's the foundation everything above has already been built against. The placeholder `temp-user-1` IDs, the shape of the API routes, the IDOR-protection design in Section 6 — all of it already assumes what real authentication will look like. Phase 7 is where that assumption becomes true.

Concretely, it involves:
1. Setting up Better Auth with the Prisma adapter (Section 1).
2. Building the sign-up and login forms.
3. Replacing every `temp-user-1` reference with the real, session-derived user ID (Section 6).
4. Adding password hashing (Section 6).
5. Wiring up the deployment pipeline end-to-end (Section 8), so what ships afterward is the authenticated version, not the placeholder one.
