"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DESCRIPTION_MAX = 2000;

export default function NewLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingInternship, setLoadingInternship] = useState(true);
  const [internshipId, setInternshipId] = useState(null);
  const [error, setError] = useState(null);
  // Synchronous guard — prevents double-submit before React re-renders the button.
  const loadingRef = useRef(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    hours: "",
  });

  useEffect(() => {
    async function loadActiveInternship() {
      try {
        const res = await fetch("/api/internships");
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
          const active = data.data.find((item) => item.status === "ACTIVE") || data.data[0];
          setInternshipId(active.id);
        } else {
          setError("No active internship found. Please configure your profile first.");
        }
      } catch (err) {
        setError("Failed to verify internship status.");
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
    if (loadingRef.current) return; // synchronous double-submit guard
    if (!internshipId) {
      setError("Cannot save log without an active internship.");
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId,
          // UTC midnight — appending T00:00:00.000Z avoids local-timezone shift.
          // new Date("YYYY-MM-DD") is parsed as local midnight (UTC+8) which stores
          // the wrong UTC date and causes Activity Timeline to show -1 day.
          date: form.date + "T00:00:00.000Z",
          description: form.description,
          hours: parseFloat(form.hours),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  if (loadingInternship) {
    return (
      <div style={shellStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "var(--space-4)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading internship details…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      {/* Back navigation */}
      <Link href="/dashboard" style={backLinkStyle}>
        ← Back to Dashboard
      </Link>

      <div style={cardStyle}>
        {/* Card header with accent bar */}
        <div style={cardHeaderStyle}>
          <div style={accentBarStyle} />
          <div>
            <h1 style={pageTitleStyle}>Add Daily Log</h1>
            <p style={pageSubtitleStyle}>Record your hours and describe what you accomplished.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>

          {/* Date */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="log-date">Date</label>
            <input
              id="log-date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Hours */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="log-hours">Hours Worked</label>
            <input
              id="log-hours"
              type="number"
              name="hours"
              value={form.hours}
              onChange={handleChange}
              min="0.5"
              max="24"
              step="0.5"
              placeholder="e.g. 8"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={labelStyle} htmlFor="log-description">What did you do today?</label>
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: form.description.length > DESCRIPTION_MAX * 0.9 ? "var(--danger)" : "var(--text-muted)",
                letterSpacing: "0.02em",
              }}>
                {form.description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
            <textarea
              id="log-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              maxLength={DESCRIPTION_MAX}
              placeholder="Describe your tasks, learnings, and accomplishments…"
              required
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {/* Buttons */}
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
              disabled={loading}
              style={loading ? { ...primaryBtnStyle, opacity: 0.6, cursor: "not-allowed" } : primaryBtnStyle}
            >
              {loading ? "Saving…" : "Save Log"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ── Inline style objects (use CSS vars from design system) ───────────────── */

const shellStyle = {
  maxWidth: 520,
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

