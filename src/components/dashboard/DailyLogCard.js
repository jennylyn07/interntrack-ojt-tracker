// File: src/components/dashboard/DailyLogCard.js
// Purpose: Show a quick preview of today's latest log and provide a clear CTA.

import Link from "next/link";
import styles from "./DailyLogCard.module.css";

export default function DailyLogCard({ todayLog }) {
  const hasLog = Boolean(todayLog?.hasLog);

  return (
    <section className={styles.card} aria-label="Daily log">
      <div className={styles.header}>
        <h2 className={styles.title}>Daily Log</h2>
        <span className={styles.dateBadge}>{todayLog?.date ?? ""}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.hoursRow}>
          <p className={styles.hoursLabel}>Today&apos;s hours</p>
          <p className={styles.hoursValue}>
            {todayLog?.hoursToday ?? 0}
            <span className={styles.hoursUnit}>h</span>
          </p>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <p className={styles.previewLabel}>Journal preview</p>
        <p className={styles.previewText}>
          {hasLog
            ? todayLog?.summary
            : "No log yet today. Add a short entry to keep your progress consistent."}
        </p>
      </div>

      <Link href="/dashboard/logs/new" className={styles.cta}>
        Add New Log
      </Link>
    </section>
  );
}