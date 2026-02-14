// File: src/app/dashboard/page.js
// Purpose: Student dashboard page (server-rendered).
//
// Why Server Component?
// - Dashboard is primarily a read-only view of student data.
// - Server rendering is fast for first load and is ideal once Prisma + NextAuth
//   are integrated (we will fetch data securely on the server).
// - Client components are used only for interactive widgets (theme toggle,
//   checklist).

import { getDashboardOverview } from "@/lib/dashboard-data";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProgressCard from "@/components/dashboard/ProgressCard";
import DailyLogCard from "@/components/dashboard/DailyLogCard";
import ChecklistCard from "@/components/dashboard/ChecklistCard";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import QuickActions from "@/components/dashboard/QuickActions";

import styles from "./page.module.css";

function formatNowLabel(date) {
  // Teaching note:
  // We format on the server to provide a consistent initial render.
  // Later, you might prefer formatting on the client for the user's locale.
  return date.toLocaleString("en-PH", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  // Data source is abstracted.
  // TODO (Next step): replace this with getDashboardOverview(userId)
  // where `userId` comes from NextAuth's session.
  const data = await getDashboardOverview();
  const nowLabel = formatNowLabel(new Date());

  return (
    <div className={styles.page}>
      <DashboardHeader student={data.student} nowLabel={nowLabel} />

      {/* Grid layout:
          - Mobile: cards stack.
          - Desktop (1024px+): two columns and timeline full-width below. */}
      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <ProgressCard progress={data.progress} />
          <QuickActions />
        </div>

        <div className={styles.rightColumn}>
          <DailyLogCard todayLog={data.todayLog} />
          <ChecklistCard items={data.checklistItems} />
        </div>

        <div className={styles.timeline}>
          <ActivityTimeline timeline={data.timeline} />
        </div>
      </div>
    </div>
  );
}
