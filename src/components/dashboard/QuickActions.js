// File: src/components/dashboard/QuickActions.js
// Purpose: Provide fast navigation/actions a student commonly needs.
//
// Phase 6: Wired up Add Log and Edit Profile to real routes.
// Download Report remains a placeholder until Phase 8.

import Link from "next/link";
import styles from "./QuickActions.module.css";

export default function QuickActions() {
  return (
    <section className={styles.card} aria-label="Quick actions">
      <h2 className={styles.title}>Quick Actions</h2>

      <div className={styles.actions}>
        {/* Phase 6: Wired to real route */}
        <Link href="/dashboard/logs/new" className={styles.action}>
          Add Log
        </Link>

        {/* Phase 6: Wired to real route */}
        <Link href="/dashboard/profile" className={styles.action}>
          Edit Profile
        </Link>

        {/* Phase 8: Will generate PDF/CSV report */}
        <button
          type="button"
          className={styles.action}
          aria-label="Download report"
          disabled
          title="Report download coming soon"
        >
          Download Report
        </button>
      </div>
    </section>
  );
}