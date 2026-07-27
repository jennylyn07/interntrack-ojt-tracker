// File: src/app/dashboard/internships/page.js
// Purpose: List all of the user's internships (active + past history).

import { getUserInternships } from "@/lib/dashboard-data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import InternshipList from "@/components/dashboard/InternshipList";

export const dynamic = "force-dynamic";

export default async function InternshipsPage({ searchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const showArchived = resolvedParams?.showArchived === "1";

  const internships = await getUserInternships(session.user.id, showArchived);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", animation: "fadeSlideUp 0.35s ease both" }}>
      {/* Page header card */}
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-3) var(--space-4)",
        boxShadow: "var(--shadow-elevated)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-2)",
        marginBottom: "var(--space-3)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Accent bar */}
        <div style={{
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: 4,
          borderRadius: "0 4px 4px 0",
          background: "linear-gradient(180deg, var(--accent-light), var(--accent))",
        }} />

        <div>
          <Link href="/dashboard" style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "0.02em",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}>
            ← Dashboard
          </Link>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--text-primary)",
            marginTop: 6,
          }}>
            {showArchived ? "Archived Internships" : "My Internships"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 3 }}>
            {internships.length === 0
              ? showArchived ? "No archived internships." : "No internships yet. Add your first one below."
              : `${internships.length} internship${internships.length === 1 ? "" : "s"}${showArchived ? " archived" : " on record"}.`}
          </p>

          {/* Archive toggle */}
          <Link
            href={showArchived ? "/dashboard/internships" : "/dashboard/internships?showArchived=1"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 10,
              fontSize: "0.8rem",
              color: "var(--accent)",
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface)",
              boxShadow: "var(--shadow-soft-inner)",
            }}
          >
            {showArchived ? "← Show active" : "Show archived"}
          </Link>
        </div>

        {/* Only show "+ Add Internship" in the default (non-archived) view */}
        {!showArchived && (
          <Link
            href="/dashboard/internships/new"
            style={{
              padding: "12px 22px",
              borderRadius: "var(--radius-pill)",
              background: "linear-gradient(135deg, var(--accent-light), var(--accent))",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              boxShadow: "var(--shadow-accent)",
              letterSpacing: "0.01em",
            }}
          >
            + Add Internship
          </Link>
        )}
      </div>

      {/* Interactive card list — client component. */}
      <InternshipList
        key={showArchived ? "archived" : "active"}
        initialInternships={internships}
        showArchived={showArchived}
      />
    </div>
  );
}


