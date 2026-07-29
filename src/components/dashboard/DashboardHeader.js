// File: src/components/dashboard/DashboardHeader.js
// Purpose: Dashboard header showing app title, student identity, current date/time,
// and the theme toggle.

import ThemeToggle from "@/components/ui/ThemeToggle";
import SignOutButton from "@/components/dashboard/SignOutButton";
import Link from "next/link";
import styles from "./DashboardHeader.module.css";

export default function DashboardHeader({ student, nowLabel }) {
  const name = student?.name ?? "Student";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* Neomorphic avatar circle */}
        <div className={styles.avatar} aria-hidden="true">
          {initial}
        </div>

        <div className={styles.leftText}>
          <p className={styles.appTitle}>OJT Tracker</p>
          <h1 className={styles.studentName}>{name}</h1>
          <p className={styles.meta}>
            <span className={styles.metaItem}>{nowLabel}</span>
            {student?.company ? (
              <>
                <span className={styles.metaDot} aria-hidden="true" />
                <span className={styles.metaItem}>{student.company}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <Link
          href="/dashboard/settings"
          className={styles.settingsLink}
          title="Account settings"
          aria-label="Account settings"
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
        <SignOutButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
