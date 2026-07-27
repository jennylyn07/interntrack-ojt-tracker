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
  ACTIVE:    { color: "#1a7a37" },
  PENDING:   { color: "#8a5a00" },
  COMPLETED: { color: "#2f5754" },
  CANCELLED: { color: "#666" },
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
    // Backdrop with blur
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-3)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Modal box */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-4)",
          boxShadow: "var(--shadow-elevated)",
          maxWidth: 460,
          width: "100%",
          animation: "fadeSlideUp 0.25s ease",
        }}
      >
        {/* Red accent strip at top */}
        <div style={{
          height: 4, borderRadius: "var(--radius-pill)",
          background: "linear-gradient(90deg, #c0392b, #e74c3c)",
          marginBottom: "var(--space-2)",
        }} />

        <h2 id="delete-modal-title" style={{
          fontSize: "1.1rem", fontWeight: 800,
          letterSpacing: "-0.015em",
          marginBottom: "var(--space-2)",
          color: "var(--text-primary)",
        }}>
          Delete &ldquo;{internship.company}&rdquo;?
        </h2>

        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "var(--space-3)" }}>
            Loading record counts…
          </p>
        ) : (
          <p style={{
            fontSize: "0.9rem", lineHeight: 1.65,
            marginBottom: "var(--space-3)", color: "var(--text-primary)",
            opacity: 0.8,
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
            color: "var(--danger)", fontSize: "0.85rem",
            padding: "10px 14px",
            background: "rgba(192,57,43,0.06)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-soft-inner)",
            marginBottom: "var(--space-2)",
          }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-pill)",
              border: 0,
              background: "var(--surface)",
              boxShadow: "var(--shadow-soft-outer)",
              color: "var(--text-muted)",
              fontSize: "0.88rem", fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={deleting || loading}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: "linear-gradient(135deg, #e74c3c, #c0392b)",
              color: "#fff",
              fontSize: "0.88rem", fontWeight: 700,
              letterSpacing: "0.01em",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.6 : 1,
              boxShadow: "4px 4px 14px rgba(192,57,43,0.35)",
              fontFamily: "inherit",
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
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-4)",
        textAlign: "center",
        boxShadow: "var(--shadow-elevated)",
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
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
          const { color } = STATUS_COLOR[internship.status] ?? STATUS_COLOR.CANCELLED;

          return (
            <div
              key={internship.id}
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-3) var(--space-4)",
                boxShadow: "var(--shadow-elevated)",
                opacity: showArchived ? 0.72 : 1,
                position: "relative",
                overflow: "hidden",
                transition: "transform 200ms, box-shadow 260ms",
              }}
            >
              {/* Left accent bar */}
              <div style={{
                position: "absolute", left: 0, top: "15%", bottom: "15%",
                width: 4,
                borderRadius: "0 4px 4px 0",
                background: `linear-gradient(180deg, ${color ?? "var(--accent)"}, color-mix(in srgb, ${color ?? "var(--accent)"} 40%, transparent))`,
              }} />

              {/* Card header */}
              <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "var(--space-2)", flexWrap: "wrap",
                marginBottom: "var(--space-2)",
              }}>
                <div>
                  <h2 style={{
                    fontSize: "1.1rem", fontWeight: 800,
                    letterSpacing: "-0.015em",
                    color: "var(--text-primary)",
                    marginBottom: 4,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    {internship.company}
                    {showArchived && (
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 700,
                        color: "var(--text-muted)",
                        background: "var(--surface)",
                        padding: "2px 9px",
                        borderRadius: "var(--radius-pill)",
                        boxShadow: "var(--shadow-soft-inner)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}>Archived</span>
                    )}
                  </h2>
                  <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    Supervisor: {internship.supervisor}
                  </p>
                  <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {formatDate(internship.startDate)}
                    {internship.endDate ? ` → ${formatDate(internship.endDate)}` : " → present"}
                  </p>
                </div>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.75rem", fontWeight: 700,
                  color,
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-soft-inner)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}>
                  {STATUS_LABEL[internship.status]}
                </span>
              </div>

              {/* Progress bar — gradient style matching ProgressCard */}
              <div style={{ marginBottom: "var(--space-2)" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "0.78rem", marginBottom: 7,
                }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                    {internship.completedHours}h of {internship.requiredHours}h
                  </span>
                  <span style={{
                    fontWeight: 800, fontSize: "0.85rem",
                    color: "var(--accent)",
                    letterSpacing: "-0.02em",
                  }}>{pct}%</span>
                </div>
                <div style={{
                  height: 8,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-soft-inner)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: "linear-gradient(90deg, var(--accent-light), var(--accent))",
                    borderRadius: "var(--radius-pill)",
                    transition: "width 0.5s ease",
                    boxShadow: "var(--shadow-accent)",
                  }} />
                </div>
              </div>

              {/* Action row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                flexWrap: "wrap",
                paddingTop: "var(--space-1)",
                borderTop: "1px solid",
                borderColor: "var(--muted)",
              }}>
                {/* LEFT: Edit + Archive */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isEditable && (
                    <Link
                      href={`/dashboard/internships/${internship.id}/edit`}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "var(--radius-pill)",
                        border: 0,
                        background: "var(--surface)",
                        boxShadow: "var(--shadow-soft-outer)",
                        color: "var(--accent)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        letterSpacing: "0.01em",
                      }}
                    >
                      Edit
                    </Link>
                  )}

                  <button
                    onClick={() => toggleArchive(internship)}
                    disabled={isPending}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-pill)",
                      border: 0,
                      background: "var(--surface)",
                      boxShadow: "var(--shadow-soft-outer)",
                      color: "var(--text-muted)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: isPending ? "not-allowed" : "pointer",
                      opacity: isPending ? 0.5 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {isPending ? "…" : showArchived ? "Unarchive" : "Archive"}
                  </button>
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* RIGHT: Delete */}
                <button
                  onClick={() => setDeleteTarget(internship)}
                  disabled={isPending}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "var(--radius-pill)",
                    border: 0,
                    background: "var(--surface)",
                    boxShadow: "var(--shadow-soft-outer)",
                    color: "var(--danger)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.5 : 1,
                    fontFamily: "inherit",
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
