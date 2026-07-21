// File: src/app/dashboard/internships/page.js
// Purpose: List all of the user's internships (active + past history).
//
// Architecture note:
// - Server Component: data is read-only, no client interaction on this page.
// - Each internship links to its own /edit page; "+ Add Internship" links
//   to /dashboard/internships/new.
// - COMPLETED/CANCELLED internships are shown in a muted style — read-only
//   history preserved but visually de-emphasised.

import { getUserInternships } from "@/lib/dashboard-data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  ACTIVE: "Active",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR = {
  ACTIVE: { bg: "rgba(52,199,89,0.12)", color: "#1a7a37" },
  PENDING: { bg: "rgba(255,159,10,0.12)", color: "#8a5a00" },
  COMPLETED: { bg: "rgba(76,115,111,0.12)", color: "#2f5754" },
  CANCELLED: { bg: "rgba(142,142,147,0.12)", color: "#555" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function InternshipsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const internships = await getUserInternships(session.user.id);

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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: 6 }}>My Internships</h1>
          <p style={{ color: "var(--accent)", fontSize: "0.9rem", marginTop: 2 }}>
            {internships.length === 0
              ? "No internships yet. Add your first one below."
              : `${internships.length} internship${internships.length === 1 ? "" : "s"} on record.`}
          </p>
        </div>
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
      </div>

      {/* Internship cards */}
      {internships.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--muted)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          textAlign: "center",
          boxShadow: "var(--shadow-soft-outer)",
        }}>
          <p style={{ color: "var(--accent)", fontSize: "0.95rem" }}>
            You haven&apos;t added an internship yet. Use the button above to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {internships.map((internship) => {
            const isEditable = internship.status === "ACTIVE" || internship.status === "PENDING";
            const pct = internship.requiredHours > 0
              ? Math.min(100, Math.round((internship.completedHours / internship.requiredHours) * 100))
              : 0;
            const { bg, color } = STATUS_COLOR[internship.status] ?? STATUS_COLOR.CANCELLED;

            return (
              <div
                key={internship.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--muted)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-3)",
                  boxShadow: "var(--shadow-soft-outer)",
                  opacity: isEditable ? 1 : 0.75,
                }}
              >
                {/* Card header row */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                  marginBottom: "var(--space-2)",
                }}>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>
                      {internship.company}
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--accent)" }}>
                      Supervisor: {internship.supervisor}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--accent)", marginTop: 2 }}>
                      {formatDate(internship.startDate)}
                      {internship.endDate ? ` → ${formatDate(internship.endDate)}` : " → present"}
                    </p>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: bg,
                    color,
                    whiteSpace: "nowrap",
                  }}>
                    {STATUS_LABEL[internship.status]}
                  </span>
                </div>

                {/* Hours progress */}
                <div style={{ marginBottom: "var(--space-2)" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    marginBottom: 6,
                  }}>
                    <span style={{ color: "var(--accent)" }}>
                      {internship.completedHours}h completed of {internship.requiredHours}h required
                    </span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{
                    height: 8,
                    borderRadius: 999,
                    background: "var(--muted)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--accent)",
                      borderRadius: 999,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  {isEditable ? (
                    <Link
                      href={`/dashboard/internships/${internship.id}/edit`}
                      style={{
                        padding: "7px 18px",
                        borderRadius: 999,
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      Edit
                    </Link>
                  ) : (
                    <span style={{
                      padding: "7px 18px",
                      borderRadius: 999,
                      border: "1px solid var(--muted)",
                      color: "var(--accent)",
                      fontSize: "0.85rem",
                      opacity: 0.6,
                    }}>
                      Read-only history
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
