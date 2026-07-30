"use client";

// File: src/app/dashboard/journal/[id]/JournalEntryActions.js
// Purpose: Client island for Edit and Delete buttons on the entry view page.
//
// Why a separate client component?
// The parent page.js is a server component (for auth + DB). We only need
// the router + confirm dialog for delete — isolating it here keeps the
// server component clean and avoids making the whole page a client component.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JournalEntryActions({ entryId }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/journal/${entryId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete entry.");
        setDeleting(false);
        return;
      }
      router.push("/dashboard/journal");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Action bar */}
      <div style={actionBarStyle}>
        <Link href={`/dashboard/journal/${entryId}/edit`} style={editBtnStyle} id="journal-edit-btn">
          ✏️ Edit Entry
        </Link>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          style={deleteBtnStyle}
          id="journal-delete-btn"
        >
          🗑 Delete
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          style={overlayStyle}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-journal-title"
            style={modalStyle}
          >
            <h2 id="delete-journal-title" style={modalTitleStyle}>
              Delete this entry?
            </h2>
            <p style={modalBodyStyle}>
              This journal entry will be permanently removed. This action cannot be undone.
            </p>

            {error && (
              <p style={errorStyle}>{error}</p>
            )}

            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                style={cancelBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                id="journal-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
                style={confirmDeleteBtnStyle}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Inline styles ─────────────────────────────────────────────────────────── */

const actionBarStyle = {
  display: "flex",
  gap: "var(--space-2)",
  flexWrap: "wrap",
};

const editBtnStyle = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "12px 20px",
  borderRadius: "var(--radius-pill)",
  background: "var(--surface)",
  boxShadow: "var(--shadow-soft-outer)",
  color: "var(--accent)",
  fontWeight: 700,
  fontSize: "0.92rem",
  textDecoration: "none",
  transition: "transform 150ms, box-shadow 260ms",
};

const deleteBtnStyle = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "12px 20px",
  borderRadius: "var(--radius-pill)",
  border: "none",
  background: "var(--surface)",
  boxShadow: "var(--shadow-soft-outer)",
  color: "var(--danger)",
  fontWeight: 600,
  fontSize: "0.92rem",
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "transform 150ms, box-shadow 260ms",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-3)",
  animation: "fadeIn 0.2s ease",
};

const modalStyle = {
  background: "var(--surface)",
  borderRadius: "var(--radius-xl)",
  padding: "var(--space-4)",
  boxShadow: "var(--shadow-elevated)",
  maxWidth: 420,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  animation: "fadeSlideUp 0.25s ease",
};

const modalTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--text-primary)",
};

const modalBodyStyle = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  lineHeight: 1.55,
};

const errorStyle = {
  fontSize: "0.85rem",
  color: "var(--danger)",
  fontWeight: 500,
};

const cancelBtnStyle = {
  padding: "10px 20px",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--muted)",
  background: "var(--surface)",
  color: "var(--text-primary)",
  fontSize: "0.88rem",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const confirmDeleteBtnStyle = {
  padding: "10px 20px",
  borderRadius: "var(--radius-pill)",
  border: "none",
  background: "#c0392b",
  color: "#fff",
  fontSize: "0.88rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};
