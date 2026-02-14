"use client";

// File: src/components/dashboard/ChecklistCard.js
// Purpose: An interactive checklist representing internship requirements.
//
// Why client component?
// - Toggling checklist items is local UI state (interaction).
// - Later this can be persisted via an API route (app/api/checklist/route.ts).
//
// Teaching note:
// We keep this component self-contained. The dashboard page provides initial
// checklist data (server), then the client handles interactions.

import { useMemo, useState } from "react";
import styles from "./ChecklistCard.module.css";

// Component: ChecklistCard
// Props:
// - items: Array<{ id: string, label: string, completed: boolean }>
export default function ChecklistCard({ items }) {
  const initial = useMemo(() => items ?? [], [items]);
  const [localItems, setLocalItems] = useState(initial);

  function toggle(id) {
    setLocalItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    );

    // TODO (Next step): persist to backend.
    // Example:
    // await fetch("/api/checklist", { method: "POST", body: JSON.stringify({ id, completed }) })
  }

  const completedCount = localItems.filter((x) => x.completed).length;

  return (
    <section className={styles.card} aria-label="Internship checklist">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Checklist</h2>
          <p className={styles.subtitle}>
            {completedCount}/{localItems.length} completed
          </p>
        </div>
      </div>

      <ul className={styles.list}>
        {localItems.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <button
              type="button"
              className={styles.itemButton}
              onClick={() => toggle(item.id)}
              aria-pressed={item.completed}
            >
              <span
                className={item.completed ? styles.checkOn : styles.checkOff}
                aria-hidden="true"
              />
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
