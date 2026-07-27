// File: src/components/dashboard/ActivityTimeline.js
// Purpose: Show a chronological timeline of recent internship activities.

import styles from "./ActivityTimeline.module.css";

export default function ActivityTimeline({ timeline }) {
  const items = timeline ?? [];

  return (
    <section className={styles.card} aria-label="Activity timeline">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Activity Timeline</h2>
          <p className={styles.subtitle}>A quick look at your recent entries.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No activity yet. Add your first log entry to see it here.</p>
      ) : (
        <ol className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.dateBadge}>{item.date}</div>
              <div className={styles.content}>
                <div className={styles.row}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  {typeof item.hours === "number" ? (
                    <span className={styles.hoursBadge}>{item.hours}h</span>
                  ) : null}
                </div>
                {item.type ? <span className={styles.typeChip}>{item.type}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

