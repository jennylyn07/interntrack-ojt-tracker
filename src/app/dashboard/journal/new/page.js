"use client";

// File: src/app/dashboard/journal/new/page.js
// Purpose: New journal entry form.
//
// Features:
// - Date picker (defaults to today)
// - Optional title
// - Large content textarea
// - Mood selector (5 pill-shaped toggle buttons with emoji)
// - Loads active internship on mount; shows error if none found
// - On success → redirects to /dashboard/journal

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Mood options ──────────────────────────────────────────────────────────────
const MOODS = [
  { value: "GREAT",    emoji: "🌟", label: "Great" },
  { value: "GOOD",     emoji: "😊", label: "Good" },
  { value: "OKAY",     emoji: "😐", label: "Okay" },
  { value: "ROUGH",    emoji: "😔", label: "Rough" },
  { value: "TERRIBLE", emoji: "😞", label: "Terrible" },
];

export default function NewJournalPage() {
  const router = useRouter();

  const [internshipId, setInternshipId] = useState(null);
  const [loadingInternship, setLoadingInternship] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: "",
    content: "",
    mood: "OKAY",
  });

  // Load the active internship on mount
  useEffect(() => {
    async function loadActiveInternship() {
      try {
        const res = await fetch("/api/internships");
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          const active = data.data.find((i) => i.status === "ACTIVE") ?? data.data[0];
          setInternshipId(active.id);
        } else {
          setError("No active internship found. Please configure your internship profile first.");
        }
      } catch {
        setError("Failed to load internship details. Please try again.");
      } finally {
        setLoadingInternship(false);
      }
    }
    loadActiveInternship();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!internshipId) {
      setError("Cannot save entry without an active internship.");
      return;
    }
    if (!form.content.trim()) {
      setError("Please write something before saving.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId,
          date: new Date(form.date).toISOString(),
          title: form.title.trim() || null,
          content: form.content.trim(),
          mood: form.mood,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard/journal");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingInternship) {
    return (
      <div style={shellStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "var(--space-4)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Loading internship details…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      {/* Back navigation */}
      <Link href="/dashboard/journal" style={backLinkStyle}>
        ← Journal
      </Link>

      <div style={cardStyle}>
        {/* Card header */}
        <div style={cardHeaderStyle}>
          <div style={accentBarStyle} />
          <div>
            <h1 style={pageTitleStyle}>New Journal Entry</h1>
            <p style={pageSubtitleStyle}>
              Reflect on your day — your thoughts, learnings, and feelings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>

          {/* Date */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="journal-date">Date</label>
            <input
              id="journal-date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Mood selector */}
          <div style={fieldStyle}>
            <span style={labelStyle}>How are you feeling?</span>
            <div style={moodRowStyle} role="group" aria-label="Mood selector">
              {MOODS.map(({ value, emoji, label }) => {
                const selected = form.mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    id={`mood-${value.toLowerCase()}`}
                    aria-pressed={selected}
                    onClick={() => setForm((prev) => ({ ...prev, mood: value }))}
                    style={selected ? selectedMoodBtnStyle : moodBtnStyle}
                    title={label}
                  >
                    <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{emoji}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, marginTop: 2 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional title */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="journal-title">
              Title <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="journal-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Give this entry a title…"
              maxLength={200}
              style={inputStyle}
            />
          </div>

          {/* Content */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="journal-content">What&apos;s on your mind?</label>
            <textarea
              id="journal-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={8}
              placeholder="Write about what you learned, how you felt, challenges you faced, or anything that stood out today…"
              required
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
            />
          </div>

          {/* Error */}
          {error && <div style={errorStyle}>{error}</div>}

          {/* Actions */}
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={cancelBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={submitting ? { ...primaryBtnStyle, opacity: 0.6, cursor: "not-allowed" } : primaryBtnStyle}
            >
              {submitting ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Style objects (reuse CSS vars from design system) ───────────────────── */

const shellStyle = {
  maxWidth: 580,
  margin: "0 auto",
  padding: "var(--space-4) var(--space-3)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
  animation: "fadeSlideUp 0.35s ease both",
};

const backLinkStyle = {
  fontSize: "0.83rem",
  fontWeight: 600,
  color: "var(--accent)",
  letterSpacing: "0.02em",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  transition: "opacity 150ms",
};

const cardStyle = {
  background: "var(--surface)",
  borderRadius: "var(--radius-xl)",
  padding: "var(--space-4)",
  boxShadow: "var(--shadow-elevated)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--space-2)",
};

const accentBarStyle = {
  width: 4,
  alignSelf: "stretch",
  minHeight: 40,
  borderRadius: "0 4px 4px 0",
  background: "linear-gradient(180deg, var(--accent-light), var(--accent))",
  flexShrink: 0,
};

const pageTitleStyle = {
  fontSize: "1.3rem",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  color: "var(--text-primary)",
  margin: 0,
};

const pageSubtitleStyle = {
  marginTop: 4,
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  fontWeight: 400,
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const labelStyle = {
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--text-primary)",
};

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "var(--surface)",
  color: "var(--text-primary)",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  fontWeight: 500,
  boxShadow: "var(--shadow-deep-inner)",
  outline: "none",
  boxSizing: "border-box",
  transition: "box-shadow 150ms",
};

const moodRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const moodBtnStyle = {
  flex: "1 1 56px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "10px 6px",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "var(--surface)",
  boxShadow: "var(--shadow-soft-outer)",
  color: "var(--text-muted)",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "transform 150ms, box-shadow 200ms, color 150ms",
};

const selectedMoodBtnStyle = {
  ...moodBtnStyle,
  boxShadow: "var(--shadow-deep-inner)",
  color: "var(--accent)",
  transform: "translateY(1px)",
};

const errorStyle = {
  padding: "12px 16px",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--danger)",
  background: "rgba(192, 57, 43, 0.06)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-soft-inner)",
  lineHeight: 1.5,
};

const cancelBtnStyle = {
  flex: 1,
  padding: "13px 24px",
  borderRadius: "var(--radius-pill)",
  border: 0,
  background: "var(--surface)",
  color: "var(--text-muted)",
  fontSize: "0.92rem",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "var(--shadow-soft-outer)",
  fontFamily: "inherit",
  transition: "transform 150ms, box-shadow 260ms",
};

const primaryBtnStyle = {
  flex: 2,
  padding: "13px 24px",
  borderRadius: "var(--radius-pill)",
  border: 0,
  background: "linear-gradient(135deg, var(--accent-light), var(--accent))",
  color: "#fff",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.02em",
  fontFamily: "inherit",
  boxShadow: "var(--shadow-accent)",
  transition: "transform 150ms, box-shadow 260ms, opacity 150ms",
};
