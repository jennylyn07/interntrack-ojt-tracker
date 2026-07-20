"use client";

// File: src/components/dashboard/ChecklistCard.js
// Purpose: An interactive checklist representing internship requirements.
//
// Why client component?
// - Toggling checklist items is local UI state (interaction).
// - Persists changes via /api/checklist/[id] PUT route.
//
// Pattern used: Optimistic Updates
// - UI updates immediately on click for a fast feel
// - API call happens in background
// - If API fails, UI reverts back to previous state

import { useMemo, useState } from "react";
import styles from "./ChecklistCard.module.css";

// Component: ChecklistCard
// Props:
// - items: Array<{ id: string, label: string, completed: boolean }>
export default function ChecklistCard({ items }) {
  const initial = useMemo(() => items ?? [], [items]);
  const [localItems, setLocalItems] = useState(initial);

  async function toggle(id) {
    // Find the current item and its completed value
    const item = localItems.find((it) => it.id === id);
    const newCompleted = !item.completed;

    // Step 1: Optimistic update — update UI immediately
    // without waiting for the API response
    setLocalItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, completed: newCompleted } : it
      )
    );

    // Step 2: Persist to backend
    try {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!res.ok) {
        // Step 3a: API failed — revert UI back to original state
        setLocalItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, completed: item.completed } : it
          )
        );
        console.error("Failed to update checklist item");
      }
      // Step 3b: API succeeded — UI is already correct, nothing to do

    } catch (error) {
      // Step 3a: Network error — revert UI back to original state
      setLocalItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, completed: item.completed } : it
        )
      );
      console.error("Network error:", error);
    }
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

      {localItems.length === 0 ? (
        <p className={styles.empty}>
          No checklist items yet.
        </p>
      ) : (
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
      )}
    </section>
  );
}