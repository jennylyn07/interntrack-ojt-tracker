// File: src/app/dashboard/internships/new/page.js
// Purpose: Form to create a brand-new internship record.
//
// This ONLY ever calls POST /api/internships — it never touches any
// existing internship. It is the intentional entry point for starting
// a second (or third) internship term.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewInternshipPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    company: "",
    supervisor: "",
    requiredHours: "",
    startDate: new Date().toISOString().slice(0, 10),
    status: "ACTIVE",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          supervisor: form.supervisor,
          requiredHours: parseInt(form.requiredHours, 10),
          startDate: new Date(form.startDate).toISOString(),
          status: form.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create internship.");
        return;
      }

      // Redirect to the list — do not refresh dashboard (the new internship
      // may not be ACTIVE yet; dashboard keeps showing the current ACTIVE one).
      router.push("/dashboard/internships");

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={shellStyle}>
      <Link href="/dashboard/internships" style={backLinkStyle}>
        ← My Internships
      </Link>

      <div style={cardStyle}>
        {/* Card header */}
        <div style={cardHeaderStyle}>
          <div style={accentBarStyle} />
          <div>
            <h1 style={titleStyle}>Add New Internship</h1>
            <p style={subtitleStyle}>
              This will create a new internship record without affecting any existing ones.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="company">Company Name</label>
            <input style={inputStyle} type="text" id="company" name="company"
              placeholder="e.g. Acme Tech Solutions" value={form.company}
              onChange={handleChange} required disabled={saving} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="supervisor">Supervisor Name</label>
            <input style={inputStyle} type="text" id="supervisor" name="supervisor"
              placeholder="e.g. Engr. Jane Doe" value={form.supervisor}
              onChange={handleChange} required disabled={saving} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="requiredHours">Total Required Hours</label>
            <input style={inputStyle} type="number" id="requiredHours" name="requiredHours"
              placeholder="e.g. 600" min="10" max="2000" value={form.requiredHours}
              onChange={handleChange} required disabled={saving} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="startDate">OJT Start Date</label>
            <input style={inputStyle} type="date" id="startDate" name="startDate"
              value={form.startDate} onChange={handleChange} required disabled={saving} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="status">Status</label>
            <select style={inputStyle} id="status" name="status"
              value={form.status} onChange={handleChange} required disabled={saving}>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={actionRowStyle}>
            <button type="button" style={cancelBtnStyle}
              onClick={() => router.back()} disabled={saving}>
              Cancel
            </button>
            <button type="submit"
              style={saving ? { ...primaryBtnStyle, opacity: 0.5, cursor: "not-allowed" } : primaryBtnStyle}
              disabled={saving}>
              {saving ? "Creating…" : "Create Internship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const shellStyle = {
  maxWidth: 540,
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
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
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

const titleStyle = {
  fontSize: "1.3rem",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  color: "var(--text-primary)",
  margin: 0,
};

const subtitleStyle = {
  marginTop: 4,
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  fontWeight: 400,
  lineHeight: 1.55,
};

const formStyle = { display: "flex", flexDirection: "column", gap: "var(--space-2)" };

const fieldStyle = { display: "flex", flexDirection: "column", gap: 8 };

const labelStyle = {
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--text-primary)",
};

const inputStyle = {
  padding: "13px 16px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "var(--surface)",
  color: "var(--text-primary)",
  boxShadow: "var(--shadow-deep-inner)",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
  fontWeight: 500,
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

const actionRowStyle = { display: "flex", gap: "var(--space-1)", marginTop: "var(--space-1)" };

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
