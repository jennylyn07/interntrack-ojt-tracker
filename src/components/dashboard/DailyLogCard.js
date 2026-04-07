// File: src/components/dashboard/DailyLogCard.js
// Purpose: Show a quick preview of today's latest log and provide a clear CTA.
//
// Phase 6: Wired up "Add New Log" button to real route.

import Link from "next/link";
import styles from "./DailyLogCard.module.css";

// Component: DailyLogCard
// Props:
// - todayLog: { date: string, hoursToday: number, summary: string, hasLog: boolean }
export default function DailyLogCard({ todayLog }) {
  const hasLog = Boolean(todayLog?.hasLog);

  return (
    <section className={styles.card} aria-label="Daily log">
      <div className={styles.header}>
        <h2 className={styles.title}>Daily Log</h2>
        <p className={styles.date}>{todayLog?.date ?? ""}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.hoursRow}>
          <p className={styles.hoursLabel}>Today's hours</p>
          <p className={styles.hoursValue}>{todayLog?.hoursToday ?? 0}</p>
        </div>

        <p className={styles.previewLabel}>Journal preview</p>
        <p className={styles.previewText}>
          {hasLog
            ? todayLog?.summary
            : "No log yet today. Add a short entry to keep your progress consistent."}
        </p>
      </div>

      {/* Phase 6: Wired to real route */}
      <Link href="/dashboard/logs/new" className={styles.cta}>
        Add New Log
      </Link>
    </section>
  );
}