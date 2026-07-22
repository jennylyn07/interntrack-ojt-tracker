// File: src/app/dashboard/internships/page.js
// Purpose: List all of the user's internships (active + past history).
//
// Architecture note:
// - Server Component: data fetch stays server-side for speed + security.
// - Interactive actions (archive, delete) are handled by the InternshipList
//   client component, which receives the pre-fetched list as a prop.
// - "Show archived" toggle uses a ?showArchived=1 URL param so the server
//   controls the data filter — consistent with the InternshipSwitcher pattern.

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
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--space-4)",
        flexWrap: "wrap",
        gap: "var(--space-2)",
      }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 500 }}>
            ← Dashboard
          </Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: 6 }}>
            {showArchived ? "Archived Internships" : "My Internships"}
          </h1>
          <p style={{ color: "var(--accent)", fontSize: "0.9rem", marginTop: 2 }}>
            {internships.length === 0
              ? showArchived ? "No archived internships." : "No internships yet. Add your first one below."
              : `${internships.length} internship${internships.length === 1 ? "" : "s"}${showArchived ? " archived" : " on record"}.`}
          </p>

          {/* Archive toggle */}
          <Link
            href={showArchived ? "/dashboard/internships" : "/dashboard/internships?showArchived=1"}
            style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: "0.82rem",
              color: "var(--accent)",
              fontWeight: 500,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {showArchived ? "← Show active internships" : "Show archived internships"}
          </Link>
        </div>

        {/* Only show "+ Add Internship" in the default (non-archived) view */}
        {!showArchived && (
          <Link
            href="/dashboard/internships/new"
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              background: "var(--accent)",
              color: "var(--surface)",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            + Add Internship
          </Link>
        )}
      </div>

      {/* Interactive card list — client component.
          key forces a full remount when switching between active/archived
          views, preventing stale local state from leaking across navigations. */}
      <InternshipList
        key={showArchived ? "archived" : "active"}
        initialInternships={internships}
        showArchived={showArchived}
      />
    </div>
  );
}
