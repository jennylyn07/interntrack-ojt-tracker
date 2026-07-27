// File: src/app/dashboard/internships/[id]/edit/page.js
// Purpose: Edit one specific internship identified by its ID in the URL.
//
// This replaces the old /dashboard/profile page's "edit whatever we find first"
// approach. Every edit is now scoped to an explicit internship ID, making it
// safe when a user has more than one internship on record.

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditInternshipPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    company: "",
    supervisor: "",
    requiredHours: "",
    startDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/internships/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setNotFound(true);
          return;
        }

        const i = data.data;
        setForm({
          company: i.company ?? "",
          supervisor: i.supervisor ?? "",
          requiredHours: i.requiredHours ?? "",
          startDate: i.startDate ? i.startDate.slice(0, 10) : "",
          status: i.status ?? "ACTIVE",
        });
      } catch {
        setError("Failed to load internship details.");
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
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: "PUT",
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
        setError(data.error ?? "Failed to save changes.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/internships");
        router.refresh();
      }, 1200);

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 540, margin: "80px auto", padding: "0 var(--space-3)" }}>
        <div style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-4)",
          boxShadow: "var(--shadow-elevated)",
          textAlign: "center",
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading internship details…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ maxWidth: 540, margin: "80px auto", padding: "0 var(--space-3)" }}>
        <div style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-4)",
          boxShadow: "var(--shadow-elevated)",
          textAlign: "center",
        }}>
          <p style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: "var(--space-2)" }}>
            Internship not found or you don&apos;t have access.
          </p>
          <Link href="/dashboard/internships" style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.88rem" }}>
            ← Back to My Internships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <Link
        href="/dashboard/internships"
        style={backLinkStyle}
      >
        ← All internships
      </Link>

      <div style={cardStyle}>
        {/* Card header */}
        <div style={cardHeaderStyle}>
          <div style={accentBarStyle} />
          <div>
            <h1 style={titleStyle}>Edit Internship</h1>
            <p style={subtitleStyle}>
              Changes here only affect this internship&apos;s details — not its logs or checklist items.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>✓ Saved! Redirecting…</div>}

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="company">Company Name</label>
            <input style={inputStyle} type="text" id="company" name="company"
              value={form.company} onChange={handleChange} required disabled={saving} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="supervisor">Supervisor Name</label>
            <input style={inputStyle} type="text" id="supervisor" name="supervisor"
              value={form.supervisor} onChange={handleChange} required disabled={saving} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="requiredHours">Total Required Hours</label>
            <input style={inputStyle} type="number" id="requiredHours" name="requiredHours"
              min="10" max="2000" value={form.requiredHours}
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
              {saving ? "Saving…" : "Save Changes"}
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

const successStyle = {
  padding: "12px 16px",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#1a7a37",
  background: "rgba(52, 199, 89, 0.07)",
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
