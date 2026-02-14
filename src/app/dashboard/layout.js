// File: src/app/dashboard/layout.js
// Purpose: Route-level layout for the student dashboard.
//
// Architecture note:
// - This is a Server Component by default.
// - In the future, this is a good place to enforce authentication:
//   - Use NextAuth `getServerSession()` here.
//   - Redirect unauthenticated users to sign-in.
//
// Why have a dashboard layout?
// - It scopes dashboard-specific page structure (padding, max-width, grid)
//   without affecting other routes like / (home) or /auth.

import styles from "./layout.module.css";

export default function DashboardLayout({ children }) {
  return <main className={styles.shell}>{children}</main>;
}
