// File: src/components/dashboard/QuickActions.js
// Purpose: Provide fast navigation/actions a student commonly needs.

import Link from "next/link";
import styles from "./QuickActions.module.css";

export default function QuickActions() {
  return (
    <section className={styles.card} aria-label="Quick actions">
      <div className={styles.titleRow}>
        <span className={styles.titleIcon} aria-hidden="true">⚡</span>
        <h2 className={styles.title}>Quick Actions</h2>
      </div>

      <div className={styles.actions}>
        <Link href="/dashboard/logs/new" className={styles.action}>
          <span className={styles.actionIcon} aria-hidden="true">📝</span>
          <span className={styles.actionLabel}>Add Log</span>
          <span className={styles.actionArrow} aria-hidden="true">→</span>
        </Link>

        <Link href="/dashboard/internships" className={styles.action}>
          <span className={styles.actionIcon} aria-hidden="true">🏢</span>
          <span className={styles.actionLabel}>My Internships</span>
          <span className={styles.actionArrow} aria-hidden="true">→</span>
        </Link>

        <button
          type="button"
          className={styles.action}
          aria-label="Download report — coming soon"
          disabled
          title="Report download coming soon"
        >
          <span className={styles.actionIcon} aria-hidden="true">📊</span>
          <span className={styles.actionLabel}>Download Report</span>
        </button>
      </div>
    </section>
  );
}