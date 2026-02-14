// File: src/components/dashboard/DailyLogCard.js
// Purpose: Show a quick preview of today's latest log and provide a clear CTA.
//
// Architecture note:
// - Server Component (static preview; no client state needed).
// - Later: connect to Prisma OjtLog queries (latest log / today's log).

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
          <p className={styles.hoursLabel}>Today’s hours</p>
          <p className={styles.hoursValue}>{todayLog?.hoursToday ?? 0}</p>
        </div>

        <p className={styles.previewLabel}>Journal preview</p>
        <p className={styles.previewText}>
          {hasLog
            ? todayLog?.summary
            : "No log yet today. Add a short entry to keep your progress consistent."}
        </p>
      </div>

      {/* CTA is a button for now.
          TODO (Next step): point this to a real route like /logs/new or /dashboard/logs/new. */}
      <button type="button" className={styles.cta} aria-label="Add a new log">
        Add New Log
      </button>
    </section>
  );
}
