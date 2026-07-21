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
      <div style={{ maxWidth: 480, margin: "100px auto", textAlign: "center" }}>
        <p style={{ color: "var(--accent)" }}>Loading internship details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ maxWidth: 480, margin: "100px auto", textAlign: "center" }}>
        <p style={{ color: "#ff3b30" }}>Internship not found or you don&apos;t have access.</p>
        <Link href="/dashboard/internships" style={{ color: "var(--accent)", marginTop: 16, display: "block" }}>
          ← Back to My Internships
        </Link>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Link
        href="/dashboard/internships"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "var(--accent)",
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid var(--muted)",
          background: "var(--surface)",
          marginBottom: 4,
        }}
      >
        ← Back to all internships
      </Link>

      <h1 style={titleStyle}>Edit Internship</h1>
      <p style={subtitleStyle}>
        Changes here only affect this internship&apos;s details — not its logs or checklist items.
      </p>

      <form onSubmit={handleSubmit} style={formStyle}>
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>Saved! Redirecting...</div>}

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
          <button type="button" style={secondaryButtonStyle}
            onClick={() => router.back()} disabled={saving}>
            Cancel
          </button>
          <button type="submit" style={saving ? disabledButtonStyle : primaryButtonStyle}
            disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

const containerStyle = { maxWidth: "480px", margin: "40px auto", padding: "0 20px",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif", boxSizing: "border-box" };
const titleStyle = { fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px",
  marginTop: "12px", letterSpacing: "-0.01em" };
const subtitleStyle = { color: "var(--accent)", fontSize: "0.95rem", marginBottom: "24px", lineHeight: "1.4" };
const formStyle = { display: "flex", flexDirection: "column", gap: "18px" };
const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" };
const inputStyle = { padding: "10px 12px", fontSize: "1rem", borderRadius: "8px",
  border: "1px solid var(--muted)", backgroundColor: "var(--surface)",
  color: "var(--text-primary)", outline: "none", boxSizing: "border-box", width: "100%" };
const errorStyle = { padding: "10px 14px", fontSize: "0.85rem", fontWeight: "500",
  color: "#ff3b30", backgroundColor: "rgba(255,59,48,0.08)", borderRadius: "8px",
  border: "1px solid rgba(255,59,48,0.2)" };
const successStyle = { padding: "10px 14px", fontSize: "0.85rem", fontWeight: "500",
  color: "#34c759", backgroundColor: "rgba(52,199,89,0.08)", borderRadius: "8px",
  border: "1px solid rgba(52,199,89,0.2)" };
const actionRowStyle = { display: "flex", gap: "12px", marginTop: "12px" };
const buttonBase = { flex: 1, padding: "12px 24px", borderRadius: "999px",
  fontSize: "1rem", fontWeight: "500", cursor: "pointer", boxSizing: "border-box" };
const primaryButtonStyle = { ...buttonBase, color: "var(--surface)", backgroundColor: "var(--accent)", border: "none" };
const secondaryButtonStyle = { ...buttonBase, color: "var(--text-primary)",
  backgroundColor: "var(--surface)", border: "1px solid var(--muted)" };
const disabledButtonStyle = { ...primaryButtonStyle, opacity: 0.5, cursor: "not-allowed" };
