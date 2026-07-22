"use client";

// File: src/components/dashboard/ChecklistCard.js
// Purpose: An interactive checklist representing internship requirements.
//
// Why client component?
// - Toggling, adding, and deleting checklist items all involve local UI state.
// - All three operations persist changes via API calls with optimistic updates.
//
// Patterns used:
// - Optimistic Updates (toggle, add, delete)
// - Rollback on failure for all three operations
//
// Props:
// - items: Array<{ id: string, label: string, completed: boolean }>
// - internshipId: string | null — null means no active internship; hides the add form

import { useMemo, useState, useRef } from "react";
import styles from "./ChecklistCard.module.css";

export default function ChecklistCard({ items, internshipId }) {
  const initial = useMemo(() => items ?? [], [items]);
  const [localItems, setLocalItems] = useState(initial);
  const [addText, setAddText] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef(null);

  // -------------------------------------------------------
  // Toggle (existing behaviour — unchanged)
  // -------------------------------------------------------
  async function toggle(id) {
    const item = localItems.find((it) => it.id === id);
    const newCompleted = !item.completed;

    // Optimistic update
    setLocalItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: newCompleted } : it))
    );

    try {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!res.ok) {
        // Revert on failure
        setLocalItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, completed: item.completed } : it))
        );
        console.error("Failed to update checklist item");
      }
    } catch (error) {
      setLocalItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, completed: item.completed } : it))
      );
      console.error("Network error:", error);
    }
  }

  // -------------------------------------------------------
  // Add (Stage 2)
  // -------------------------------------------------------
  async function handleAdd(e) {
    e.preventDefault();
    const title = addText.trim();
    if (!title || !internshipId || adding) return;

    setAdding(true);

    // Optimistic: insert with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { id: tempId, label: title, completed: false };
    setLocalItems((prev) => [...prev, optimisticItem]);
    setAddText("");

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId, title }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Rollback optimistic item
        setLocalItems((prev) => prev.filter((it) => it.id !== tempId));
        console.error("Failed to add checklist item");
      } else {
        // Replace temp ID with real ID from server
        setLocalItems((prev) =>
          prev.map((it) =>
            it.id === tempId
              ? { id: data.data.id, label: data.data.title, completed: data.data.completed }
              : it
          )
        );
      }
    } catch (error) {
      setLocalItems((prev) => prev.filter((it) => it.id !== tempId));
      console.error("Network error:", error);
    } finally {
      setAdding(false);
      inputRef.current?.focus();
    }
  }

  const [deleteTarget, setDeleteTarget] = useState(null); // item object or null

  // -------------------------------------------------------
  // Delete (Stage 2)
  // -------------------------------------------------------
  async function confirmDelete(id) {
    const item = localItems.find((it) => it.id === id);
    if (!item) return;

    // Optimistic: remove from list immediately
    const removedIndex = localItems.findIndex((it) => it.id === id);
    setLocalItems((prev) => prev.filter((it) => it.id !== id));
    setDeleteTarget(null);

    try {
      const res = await fetch(`/api/checklist/${id}`, { method: "DELETE" });

      if (!res.ok) {
        // Rollback: re-insert at original position
        setLocalItems((prev) => {
          const next = [...prev];
          next.splice(removedIndex, 0, item);
          return next;
        });
        console.error("Failed to delete checklist item");
      }
    } catch (error) {
      setLocalItems((prev) => {
        const next = [...prev];
        next.splice(removedIndex, 0, item);
        return next;
      });
      console.error("Network error:", error);
    }
  }

  const completedCount = localItems.filter((x) => x.completed).length;

  return (
    <section className={styles.card} aria-label="Internship checklist">
      {/* Delete Item Confirmation Modal */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-3)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "var(--space-2)" }}>
              Remove Checklist Item?
            </h3>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.5, color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
              Are you sure you want to remove &ldquo;<strong>{deleteTarget.label}</strong>&rdquo;?
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid var(--muted)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteTarget.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: "#ff3b30",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Checklist</h2>
          <p className={styles.subtitle}>
            {completedCount}/{localItems.length} completed
          </p>
        </div>
      </div>

      {localItems.length === 0 ? (
        <p className={styles.empty}>No checklist items yet.</p>
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

              {/* Delete button — only show for real items (not temp IDs) */}
              {!item.id.startsWith("temp-") && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`Remove "${item.label}"`}
                  className={styles.deleteButton}
                  title="Remove item"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add item form — only shown when an active internship exists */}
      {internshipId && (
        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            ref={inputRef}
            type="text"
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            placeholder="Add a requirement…"
            disabled={adding}
            className={styles.addInput}
            aria-label="New checklist item title"
          />
          <button
            type="submit"
            disabled={adding || !addText.trim()}
            className={styles.addButton}
            aria-label="Add checklist item"
          >
            +
          </button>
        </form>
      )}
    </section>
  );
}