// File: src/components/dashboard/DashboardHeader.js
// Purpose: Dashboard header showing app title, student identity, current date/time,
// and the theme toggle.

import ThemeToggle from "@/components/ui/ThemeToggle";
import SignOutButton from "@/components/dashboard/SignOutButton";
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
        <SignOutButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
