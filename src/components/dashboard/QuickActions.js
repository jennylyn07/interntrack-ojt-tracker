// File: src/components/dashboard/QuickActions.js
// Purpose: Provide fast navigation/actions a student commonly needs.
//
// Architecture note:
// - Server Component: these are simple links/buttons.
// - Later: wire to real routes (Add Log, Profile, Report) once implemented.

import styles from "./QuickActions.module.css";

// Component: QuickActions
// Props: none (static for now)
export default function QuickActions() {
  return (
    <section className={styles.card} aria-label="Quick actions">
      <h2 className={styles.title}>Quick Actions</h2>

      <div className={styles.actions}>
        {/* TODO: Replace with <Link href="/logs/new"> once route exists */}
        <button type="button" className={styles.action} aria-label="Add log">
          Add Log
        </button>
        {/* TODO: Replace with <Link href="/profile"> once route exists */}
        <button type="button" className={styles.action} aria-label="Edit profile">
          Edit Profile
        </button>
        {/* TODO: Replace with actual report download (API route generating PDF/CSV) */}
        <button type="button" className={styles.action} aria-label="Download report">
          Download Report
        </button>
      </div>
    </section>
  );
}
