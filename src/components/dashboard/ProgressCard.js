// File: src/components/dashboard/ProgressCard.js
// Purpose: Primary dashboard card that visualizes internship hour progress.
//
// Architecture note:
// - Server Component (no client interactivity required).
// - Data comes in via props, making it easy to swap mock data for Prisma later.

import styles from "./ProgressCard.module.css";

// Component: ProgressCard
// Responsibility:
// - Show required/completed/remaining hours.
// - Display a neumorphic progress bar.
// Props:
// - progress: { requiredHours:number, completedHours:number, remainingHours:number, percentage:number }
export default function ProgressCard({ progress }) {
  const required = progress?.requiredHours ?? 0;
  const completed = progress?.completedHours ?? 0;
  const remaining = progress?.remainingHours ?? 0;
  const percentage = progress?.percentage ?? 0;

  return (
    <section className={styles.card} aria-label="Internship progress">
      <div className={styles.topRow}>
        <div>
          <h2 className={styles.title}>Internship Progress</h2>
          <p className={styles.subtitle}>Track your hours and stay consistent.</p>
        </div>
        <div className={styles.percent} aria-label={`Progress ${percentage}%`}>
          {percentage}%
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Required</p>
          <p className={styles.statValue}>{required}</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{completed}</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Remaining</p>
          <p className={styles.statValue}>{remaining}</p>
        </div>
      </div>

      {/* Teaching note:
          The progress track uses an “inner” shadow to feel carved into the surface,
          while the fill uses the accent color to stand out without harsh borders. */}
      <div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>
    </section>
  );
}
