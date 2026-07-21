"use client";

// File: src/components/dashboard/InternshipSwitcher.js
// Purpose: Compact dropdown shown ONLY when a user has more than one ACTIVE
// internship simultaneously. Selecting a different one navigates to
// /dashboard?internshipId=xxx, which the server picks up via searchParams
// and passes to getDashboardOverview().
//
// Architecture note:
// - Client Component: needs onChange to drive URL navigation.
// - The server dashboard page renders this conditionally — it is never
//   mounted when only one ACTIVE internship exists.

import { useRouter } from "next/navigation";

export default function InternshipSwitcher({ internships, currentId }) {
  const router = useRouter();

  function handleChange(e) {
    router.push(`/dashboard?internshipId=${e.target.value}`);
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      background: "var(--surface)",
      border: "1px solid var(--muted)",
      borderRadius: "var(--radius-md)",
      padding: "10px 16px",
      boxShadow: "var(--shadow-soft-outer)",
    }}>
      <span style={{
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "var(--accent)",
        whiteSpace: "nowrap",
      }}>
        Viewing internship:
      </span>
      <select
        value={currentId ?? ""}
        onChange={handleChange}
        aria-label="Switch active internship"
        style={{
          flex: 1,
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid var(--muted)",
          background: "var(--surface)",
          color: "var(--text-primary)",
          fontSize: "0.9rem",
          fontFamily: "inherit",
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
        }}
      >
        {internships.map((i) => (
          <option key={i.id} value={i.id}>
            {i.company}
          </option>
        ))}
      </select>
    </div>
  );
}
