# OJT Tracker – Student Dashboard

OJT Tracker is a **full-stack web application** designed for students to efficiently manage and track their On-the-Job Training (OJT) progress.

With this system, students can:

- Log daily OJT activities with task descriptions, hours rendered, and optional notes.
- Track total and remaining OJT hours.
- Monitor progress through a dynamic dashboard.
- Manage personal OJT information such as company, start date, and required hours.

This project is built with:

- **Next.js 16 (App Router)** – modern React framework for server-side rendering and routing
- **PostgreSQL** – relational database for storing users and logs
- **Prisma ORM** – for database management, migrations, and queries
- **Better Auth** – session-based authentication with the Prisma adapter
- **Plain CSS** – custom styling for a clean, responsive interface

OJT Tracker demonstrates full-stack development skills, authentication with proper session-based access control, RESTful API design, database schema management, and real-world security practices (see [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full technical writeup, including the reasoning behind each decision).

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A running PostgreSQL database (local install, or a free hosted instance from [Neon](https://neon.tech) or [Supabase](https://supabase.com))

### 1. Clone and install dependencies

```bash
git clone https://github.com/<your-username>/InternTrack-OJT-Tracker.git
cd InternTrack-OJT-Tracker/ojt-tracker
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

You'll need at minimum:
- `DATABASE_URL` — your PostgreSQL connection string
- `BETTER_AUTH_SECRET` — any long random string (used to sign session data)
- `BETTER_AUTH_URL` — `http://localhost:3000` for local development

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

This applies all tracked migrations and generates the Prisma Client.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/register` to create an account, or `/login` if you already have one.

---

## Project Structure & Architecture

For a full breakdown of the tech stack, data flow, security model, and design decisions behind this project, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Deployment

This app is designed to deploy on [Vercel](https://vercel.com), the platform built by the Next.js team. See Section 8 of [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the specific steps this project needs (environment variables, connection pooling, and running migrations against production).