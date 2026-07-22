"use client";

// File: src/components/dashboard/InternshipList.js
// Purpose: Client component for all interactive actions on the internship list.
//
// Handles:
// - Archive (sets archived:true via PUT) — optimistic remove from visible list
// - Unarchive (sets archived:false via PUT) — optimistic restore
// - Delete — opens a count-based confirmation modal, then calls DELETE.
//   Counts are fetched live from GET /api/internships/[id] so the user
//   sees the actual numbers, not a generic "are you sure?" prompt.
//
// Layout note:
// - Edit + Archive buttons are grouped on the left of the action row.
// - Delete is pushed to the right with margin/separator, reducing the chance
//   of an accidental click next to a non-destructive action.

import { useState } from "react";
import Link from "next/link";

const STATUS_LABEL = {
  ACTIVE: "Active",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR = {
  ACTIVE: { bg: "rgba(52,199,89,0.12)", color: "#1a7a37" },
  PENDING: { bg: "rgba(255,159,10,0.12)", color: "#8a5a00" },
  COMPLETED: { bg: "rgba(76,115,111,0.12)", color: "#2f5754" },
  CANCELLED: { bg: "rgba(142,142,147,0.12)", color: "#555" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// -------------------------------------------------------
// DeleteModal — shown before a permanent delete.
// Fetches real counts from the API so the message is exact.
// -------------------------------------------------------
function DeleteModal({ internship, onCancel, onDeleted }) {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ logs: 0, checklist: 0 });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch counts on mount
  useState(() => {
    (async () => {
      try {
        const res = await fetch(`/api/internships/${internship.id}`);
        const data = await res.json();
        if (data.success) {
          setCounts({
            logs: data.data.logEntries?.length ?? 0,
            checklist: data.data.checklist?.length ?? 0,
          });
        }
      } catch {
        // On error, show 0 counts — the delete will still work
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDeleteConfirm() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/internships/${internship.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to delete internship.");
        setDeleting(false);
        return;
      }
      onDeleted(internship.id);
    } catch {
      setError("Network error. Please try again.");
      setDeleting(false);
    }
  }

  return (
    // Backdrop
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-3)",
      }}
    >
      {/* Modal box — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
          maxWidth: 440,
          width: "100%",
        }}
      >
        <h2 id="delete-modal-title" style={{
          fontSize: "1.1rem", fontWeight: 700,
          marginBottom: "var(--space-2)",
        }}>
          Delete &ldquo;{internship.company}&rdquo;?
        </h2>

        {loading ? (
          <p style={{ color: "var(--accent)", fontSize: "0.9rem", marginBottom: "var(--space-3)" }}>
            Loading record counts…
          </p>
        ) : (
          <p style={{
            fontSize: "0.95rem", lineHeight: 1.6,
            marginBottom: "var(--space-3)", color: "var(--text-primary)",
          }}>
            This will permanently delete this internship
            {counts.logs > 0 && (
              <>, its <strong>{counts.logs}</strong> log {counts.logs === 1 ? "entry" : "entries"}</>
            )}
            {counts.checklist > 0 && (
              <>, and its <strong>{counts.checklist}</strong> checklist {counts.checklist === 1 ? "item" : "items"}</>
            )}
            {counts.logs === 0 && counts.checklist === 0 && (
              <> (it has no attached logs or checklist items)</>
            )}
            . <strong>This cannot be undone.</strong>
          </p>
        )}

        {error && (
          <p style={{
            color: "#ff3b30", fontSize: "0.85rem",
            marginBottom: "var(--space-2)",
          }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: "9px 20px", borderRadius: 999,
              border: "1px solid var(--muted)",
              background: "var(--surface)", color: "var(--text-primary)",
              fontSize: "0.9rem", fontWeight: 500, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={deleting || loading}
            style={{
              padding: "9px 20px", borderRadius: 999,
              border: "none",
              background: deleting ? "rgba(255,59,48,0.5)" : "#ff3b30",
              color: "#fff",
              fontSize: "0.9rem", fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// InternshipList — main export
// -------------------------------------------------------
export default function InternshipList({ initialInternships, showArchived }) {
  const [items, setItems] = useState(initialInternships);
  const [pending, setPending] = useState({}); // { [id]: true } for in-flight requests
  const [deleteTarget, setDeleteTarget] = useState(null); // internship object or null

  // Archive or unarchive an internship
  async function toggleArchive(internship) {
    const newArchived = !internship.archived;
    setPending((p) => ({ ...p, [internship.id]: true }));

    // Optimistic: remove from the current view (archive removes from main, unarchive removes from archived view)
    setItems((prev) => prev.filter((i) => i.id !== internship.id));

    try {
      const res = await fetch(`/api/internships/${internship.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: newArchived }),
      });
      if (!res.ok) {
        // Rollback
        setItems((prev) => {
          const next = [...prev, internship];
          next.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          return next;
        });
      }
    } catch {
      // Rollback on network error
      setItems((prev) => {
        const next = [...prev, internship];
        next.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        return next;
      });
    } finally {
      setPending((p) => { const n = { ...p }; delete n[internship.id]; return n; });
    }
  }

  // Called by DeleteModal on success
  function handleDeleted(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteTarget(null);
  }

  if (items.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--muted)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        textAlign: "center",
        boxShadow: "var(--shadow-soft-outer)",
      }}>
        <p style={{ color: "var(--accent)", fontSize: "0.95rem" }}>
          {showArchived
            ? "No archived internships."
            : "No internships yet. Use the button above to get started."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          internship={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {items.map((internship) => {
          const isEditable = !showArchived && (internship.status === "ACTIVE" || internship.status === "PENDING");
          const isPending = !!pending[internship.id];
          const pct = internship.requiredHours > 0
            ? Math.min(100, Math.round((internship.completedHours / internship.requiredHours) * 100))
            : 0;
          const { bg, color } = STATUS_COLOR[internship.status] ?? STATUS_COLOR.CANCELLED;

          return (
            <div
              key={internship.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--muted)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3)",
                boxShadow: "var(--shadow-soft-outer)",
                opacity: showArchived ? 0.7 : (isEditable ? 1 : 0.8),
              }}
            >
              {/* Card header */}
              <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "var(--space-2)", flexWrap: "wrap",
                marginBottom: "var(--space-2)",
              }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>
                    {internship.company}
                    {showArchived && (
                      <span style={{
                        marginLeft: 10, fontSize: "0.75rem", fontWeight: 600,
                        color: "#888", background: "var(--muted)",
                        padding: "2px 8px", borderRadius: 999,
                        verticalAlign: "middle",
                      }}>Archived</span>
                    )}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--accent)" }}>
                    Supervisor: {internship.supervisor}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--accent)", marginTop: 2 }}>
                    {formatDate(internship.startDate)}
                    {internship.endDate ? ` → ${formatDate(internship.endDate)}` : " → present"}
                  </p>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 999,
                  fontSize: "0.8rem", fontWeight: 600,
                  background: bg, color, whiteSpace: "nowrap",
                }}>
                  {STATUS_LABEL[internship.status]}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: "var(--space-2)" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "0.85rem", marginBottom: 6,
                }}>
                  <span style={{ color: "var(--accent)" }}>
                    {internship.completedHours}h completed of {internship.requiredHours}h required
                  </span>
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div style={{
                  height: 8, borderRadius: 999,
                  background: "var(--muted)", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: "var(--accent)", borderRadius: 999,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>

              {/* Action row:
                  LEFT group  — Edit (active only) + Archive/Unarchive
                  RIGHT group — Delete (separated by flex gap + margin)
                  The physical gap between left and right discourages
                  accidental clicks on Delete. */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}>
                {/* LEFT: Edit + Archive */}
                <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
                  {isEditable && (
                    <Link
                      href={`/dashboard/internships/${internship.id}/edit`}
                      style={{
                        padding: "7px 18px", borderRadius: 999,
                        border: "1px solid var(--accent)",
                        color: "var(--accent)", fontSize: "0.85rem",
                        fontWeight: 600, display: "inline-block",
                      }}
                    >
                      Edit
                    </Link>
                  )}

                  <button
                    onClick={() => toggleArchive(internship)}
                    disabled={isPending}
                    style={{
                      padding: "7px 18px", borderRadius: 999,
                      border: "1px solid var(--muted)",
                      background: "transparent",
                      color: "var(--accent)", fontSize: "0.85rem",
                      fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer",
                      opacity: isPending ? 0.5 : 1,
                    }}
                  >
                    {isPending ? "…" : showArchived ? "Unarchive" : "Archive"}
                  </button>
                </div>

                {/* Spacer — pushes Delete to the far right */}
                <div style={{ flex: 1 }} />

                {/* RIGHT: Delete — visually separated */}
                <button
                  onClick={() => setDeleteTarget(internship)}
                  disabled={isPending}
                  style={{
                    padding: "7px 18px", borderRadius: 999,
                    border: "1px solid rgba(255,59,48,0.3)",
                    background: "transparent",
                    color: "#ff3b30", fontSize: "0.85rem",
                    fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.5 : 1,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
