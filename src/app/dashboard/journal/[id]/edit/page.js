"use client";

// File: src/app/dashboard/journal/[id]/edit/page.js
// Purpose: Edit an existing journal entry.
//
// - Fetches current entry data from GET /api/journal/[id] on mount
// - Pre-populates the form
// - On submit → PUT /api/journal/[id] → redirect to entry view

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const CONTENT_MAX = 2000;
const TITLE_MAX = 200;

const MOODS = [
  { value: "GREAT",    emoji: "🌟", label: "Great" },
  { value: "GOOD",     emoji: "😊", label: "Good" },
  { value: "OKAY",     emoji: "😐", label: "Okay" },
  { value: "ROUGH",    emoji: "😔", label: "Rough" },
  { value: "TERRIBLE", emoji: "😞", label: "Terrible" },
];

export default function EditJournalPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  // Synchronous guard — prevents double-submit before React re-renders the button.
  const submittingRef = useRef(false);

  const [form, setForm] = useState({
    date: "",
    title: "",
    content: "",
    mood: "OKAY",
  });

  // Load existing entry
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/journal/${id}`);
        if (res.status === 404) { setNotFound(true); setLoading(false); return; }
        if (!res.ok) { setError("Failed to load entry."); setLoading(false); return; }
        const { data } = await res.json();
        setForm({
          date: new Date(data.date).toISOString().slice(0, 10),
          title: data.title ?? "",
          content: data.content,
          mood: data.mood,
        });
      } catch {
        setError("Network error loading entry.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return; // synchronous double-submit guard
    if (!form.content.trim()) { setError("Content cannot be empty."); return; }

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // UTC midnight — see journal/new/page.js for reasoning
          date: form.date + "T00:00:00.000Z",
          title: form.title.trim() || null,
          content: form.content.trim(),
          mood: form.mood,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Update failed."); return; }

      router.push(`/dashboard/journal/${id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={shellStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "var(--space-4)" }}>
            Loading entry…
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={shellStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: "center", color: "var(--danger)", padding: "var(--space-4)" }}>
            Entry not found.
          </p>
          <Link href="/dashboard/journal" style={{ ...backLinkStyle, alignSelf: "center" }}>
            ← Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Link href={`/dashboard/journal/${id}`} style={backLinkStyle}>
        ← Back to Entry
      </Link>

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={accentBarStyle} />
          <div>
            <h1 style={pageTitleStyle}>Edit Entry</h1>
            <p style={pageSubtitleStyle}>Update your thoughts or correct any details.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>

          {/* Date */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="edit-date">Date</label>
            <input
              id="edit-date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Mood */}
          <div style={fieldStyle}>
            <span style={labelStyle}>How were you feeling?</span>
            <div style={moodRowStyle} role="group" aria-label="Mood selector">
              {MOODS.map(({ value, emoji, label }) => {
                const selected = form.mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    id={`edit-mood-${value.toLowerCase()}`}
                    aria-pressed={selected}
                    onClick={() => setForm((prev) => ({ ...prev, mood: value }))}
                    style={selected ? selectedMoodBtnStyle : moodBtnStyle}
                    title={label}
                  >
                    <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{emoji}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, marginTop: 2 }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="edit-title">
              Title <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="edit-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Give this entry a title…"
              maxLength={TITLE_MAX}
              style={inputStyle}
            />
          </div>

          {/* Content */}
          <div style={fieldStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={labelStyle} htmlFor="edit-content">Entry</label>
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: form.content.length > CONTENT_MAX * 0.9 ? "var(--danger)" : "var(--text-muted)",
                letterSpacing: "0.02em",
              }}>
                {form.content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              id="edit-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              maxLength={CONTENT_MAX}
              required
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
            />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
            <button type="button" onClick={() => router.back()} style={cancelBtnStyle}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={submitting ? { ...primaryBtnStyle, opacity: 0.6, cursor: "not-allowed" } : primaryBtnStyle}
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Shared style objects ─────────────────────────────────────────────────── */

const shellStyle = { maxWidth: 580, margin: "0 auto", padding: "var(--space-4) var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)", animation: "fadeSlideUp 0.35s ease both" };
const backLinkStyle = { fontSize: "0.83rem", fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 };
const cardStyle = { background: "var(--surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-4)", boxShadow: "var(--shadow-elevated)", display: "flex", flexDirection: "column", gap: "var(--space-3)" };
const cardHeaderStyle = { display: "flex", alignItems: "flex-start", gap: "var(--space-2)" };
const accentBarStyle = { width: 4, alignSelf: "stretch", minHeight: 40, borderRadius: "0 4px 4px 0", background: "linear-gradient(180deg, var(--accent-light), var(--accent))", flexShrink: 0 };
const pageTitleStyle = { fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 };
const pageSubtitleStyle = { marginTop: 4, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 400 };
const fieldStyle = { display: "flex", flexDirection: "column", gap: 8 };
const labelStyle = { fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-primary)" };
const inputStyle = { width: "100%", padding: "13px 16px", borderRadius: "var(--radius-md)", border: "none", background: "var(--surface)", color: "var(--text-primary)", fontSize: "0.95rem", fontFamily: "inherit", fontWeight: 500, boxShadow: "var(--shadow-deep-inner)", outline: "none", boxSizing: "border-box", transition: "box-shadow 150ms" };
const moodRowStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
const moodBtnStyle = { flex: "1 1 56px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 6px", borderRadius: "var(--radius-md)", border: "none", background: "var(--surface)", boxShadow: "var(--shadow-soft-outer)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit", transition: "transform 150ms, box-shadow 200ms, color 150ms" };
const selectedMoodBtnStyle = { ...moodBtnStyle, boxShadow: "var(--shadow-deep-inner)", color: "var(--accent)", transform: "translateY(1px)" };
const errorStyle = { padding: "12px 16px", fontSize: "0.85rem", fontWeight: 500, color: "var(--danger)", background: "rgba(192, 57, 43, 0.06)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-soft-inner)", lineHeight: 1.5 };
const cancelBtnStyle = { flex: 1, padding: "13px 24px", borderRadius: "var(--radius-pill)", border: 0, background: "var(--surface)", color: "var(--text-muted)", fontSize: "0.92rem", fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-soft-outer)", fontFamily: "inherit" };
const primaryBtnStyle = { flex: 2, padding: "13px 24px", borderRadius: "var(--radius-pill)", border: 0, background: "linear-gradient(135deg, var(--accent-light), var(--accent))", color: "#fff", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "inherit", boxShadow: "var(--shadow-accent)" };
