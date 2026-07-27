// File: src/components/dashboard/ProgressCard.js
// Purpose: Primary dashboard card that visualizes internship hour progress.

import styles from "./ProgressCard.module.css";

export default function ProgressCard({ progress }) {
  const required = progress?.requiredHours ?? 0;
  const completed = progress?.completedHours ?? 0;
  const remaining = progress?.remainingHours ?? 0;
  const percentage = progress?.percentage ?? 0;

  return (
    <section className={styles.card} aria-label="Internship progress">
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Internship Progress</h2>
          <p className={styles.subtitle}>Track your hours and stay consistent.</p>
        </div>
        <div className={styles.percent} aria-label={`Progress ${percentage}%`}>
          {percentage}%
          <span className={styles.percentLabel}>done</span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Required</p>
          <p className={styles.statValue}>{required}<span className={styles.statUnit}>h</span></p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{completed}<span className={styles.statUnit}>h</span></p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>Remaining</p>
          <p className={styles.statValue}>{remaining}<span className={styles.statUnit}>h</span></p>
        </div>
      </div>

      <div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>

      <div className={styles.progressMeta}>
        <span className={styles.progressCaption}>{completed} of {required} hours logged</span>
        <span className={styles.progressAccent}>{percentage}% complete</span>
      </div>
    </section>
  );
}

