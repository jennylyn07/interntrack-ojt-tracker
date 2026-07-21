// File: src/app/dashboard/page.js
// Purpose: Student dashboard page (server-rendered).
//
// Why Server Component?
// - Dashboard is primarily a read-only view of student data.
// - Server rendering is fast for first load and is ideal once Prisma + NextAuth
//   are integrated (we will fetch data securely on the server).
// - Client components are used only for interactive widgets (theme toggle,
//   checklist, internship switcher).
//
// Multi-internship switching:
// - If the user has exactly one ACTIVE internship (the common case), the
//   switcher is never rendered and the URL param is ignored.
// - If the user has multiple ACTIVE internships simultaneously, a dropdown
//   is shown. Selecting a different one pushes ?internshipId=xxx to the URL
//   and this server component re-renders with the correct internship's data.

import { getDashboardOverview, getActiveInternships } from "@/lib/dashboard-data";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProgressCard from "@/components/dashboard/ProgressCard";
import DailyLogCard from "@/components/dashboard/DailyLogCard";
import ChecklistCard from "@/components/dashboard/ChecklistCard";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import QuickActions from "@/components/dashboard/QuickActions";
import InternshipSwitcher from "@/components/dashboard/InternshipSwitcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatNowLabel(date) {
  // Teaching note:
  // We format on the server to provide a consistent initial render.
  // Later, you might prefer formatting on the client for the user's locale.
  return date.toLocaleString("en-PH", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage({ searchParams }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Next.js 15+ searchParams is a Promise in server components
  const resolvedParams = await searchParams;
  const preferredInternshipId = resolvedParams?.internshipId ?? null;

  // Fetch dashboard data and active-internship list in parallel.
  // getDashboardOverview honours preferredInternshipId if supplied and valid,
  // otherwise falls back to the most-recently-started ACTIVE internship.
  const [data, activeInternships] = await Promise.all([
    getDashboardOverview(session.user.id, preferredInternshipId),
    getActiveInternships(session.user.id),
  ]);

  const nowLabel = formatNowLabel(new Date());

  // A user with no internship configured sees a setup prompt instead of
  // a confusing zeroed-out dashboard.
  const hasInternship = data.progress.requiredHours > 0;

  // Only show the switcher when the user genuinely has more than one active
  // internship at the same time — the rare concurrent-placement case.
  const showSwitcher = activeInternships.length > 1;

  return (
    <div className={styles.page}>
      <DashboardHeader student={data.student} nowLabel={nowLabel} />

      {/* Multi-ACTIVE switcher — only rendered when user has > 1 active internship */}
      {showSwitcher && (
        <InternshipSwitcher
          internships={activeInternships}
          currentId={data.internshipId}
        />
      )}

      {/* New-user empty state — shown when no internship exists yet */}
      {!hasInternship && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--muted)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          boxShadow: "var(--shadow-soft-outer)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          alignItems: "flex-start",
        }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            👋 Welcome! Let&apos;s get your OJT set up.
          </p>
          <p style={{ color: "var(--accent)", fontSize: "0.95rem", lineHeight: 1.5 }}>
            You haven&apos;t configured your internship details yet. Add your company,
            supervisor, and required hours so the dashboard can track your progress.
          </p>
          <Link
            href="/dashboard/internships/new"
            style={{
              marginTop: "var(--space-1)",
              padding: "10px 22px",
              borderRadius: 999,
              background: "var(--accent)",
              color: "var(--surface)",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "inline-block",
            }}
          >
            Set up internship profile →
          </Link>
        </div>
      )}

      {/* Grid layout:
          - Mobile: cards stack.
          - Desktop (1024px+): two columns and timeline full-width below. */}
      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <ProgressCard progress={data.progress} />
          <QuickActions />
        </div>

        <div className={styles.rightColumn}>
          <DailyLogCard todayLog={data.todayLog} />
          <ChecklistCard items={data.checklistItems} internshipId={data.internshipId} />
        </div>

        <div className={styles.timeline}>
          <ActivityTimeline timeline={data.timeline} />
        </div>
      </div>
    </div>
  );
}
