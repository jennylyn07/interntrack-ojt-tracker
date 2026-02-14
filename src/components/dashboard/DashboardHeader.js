// File: src/components/dashboard/DashboardHeader.js
// Purpose: Dashboard header showing app title, student identity, current date/time,
// and the theme toggle.
//
// Architecture note:
// - This is a Server Component by default (no "use client").
// - It can safely render a Client Component (ThemeToggle) inside.
//   This keeps most of the header SSR-friendly while still allowing
//   user interaction for theme changes.

import ThemeToggle from "@/components/ui/ThemeToggle";
import styles from "./DashboardHeader.module.css";

// Component: DashboardHeader
// Responsibility:
// - Display high-level context and controls for the dashboard.
// Props:
// - student: { name: string, program?: string, company?: string }
// - nowLabel: string (pre-formatted server-side for consistent initial render)
export default function DashboardHeader({ student, nowLabel }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <p className={styles.appTitle}>OJT Tracker</p>
        <h1 className={styles.studentName}>{student?.name ?? "Student"}</h1>
        <p className={styles.meta}>
          <span className={styles.metaItem}>{nowLabel}</span>
          {student?.company ? (
            <span className={styles.metaItem}>• {student.company}</span>
          ) : null}
        </p>
      </div>

      <div className={styles.right}>
        <ThemeToggle />
      </div>
    </header>
  );
}
