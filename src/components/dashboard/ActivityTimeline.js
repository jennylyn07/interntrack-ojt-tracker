// File: src/components/dashboard/ActivityTimeline.js
// Purpose: Show a chronological timeline of recent internship activities.
//
// Architecture note:
// - Server Component: timeline is read-only display.
// - Populated server-side via dashboard-data.js from the last 3 LogEntry records.

import styles from "./ActivityTimeline.module.css";

// Component: ActivityTimeline
// Props:
// - timeline: Array<{ id: string, date: string, title: string, hours?: number, type?: string }>
export default function ActivityTimeline({ timeline }) {
  const items = timeline ?? [];

  return (
    <section className={styles.card} aria-label="Activity timeline">
      <div className={styles.header}>
        <h2 className={styles.title}>Activity Timeline</h2>
        <p className={styles.subtitle}>A quick look at your recent entries.</p>
      </div>

      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.date}>{item.date}</div>
            <div className={styles.content}>
              <div className={styles.row}>
                <p className={styles.itemTitle}>{item.title}</p>
                {typeof item.hours === "number" ? (
                  <span className={styles.hours}>{item.hours}h</span>
                ) : null}
              </div>
              {item.type ? <p className={styles.type}>{item.type}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
