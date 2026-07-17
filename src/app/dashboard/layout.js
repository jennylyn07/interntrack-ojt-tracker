// File: src/app/dashboard/layout.js
// Purpose: Route-level layout for the student dashboard.
//
// Architecture note:
// - This is a Server Component by default.
// - Authentication is enforced in dashboard/page.js (via auth.api.getSession)
//   and at the edge in src/proxy.js (cookie-presence check).
//
// Why have a dashboard layout?
// - It scopes dashboard-specific page structure (padding, max-width, grid)
//   without affecting other routes like / (home) or /login.

import styles from "./layout.module.css";

export default function DashboardLayout({ children }) {
  return <main className={styles.shell}>{children}</main>;
}
