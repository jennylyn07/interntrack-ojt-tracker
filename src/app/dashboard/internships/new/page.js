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
    <div style={containerStyle}>
      <Link href="/dashboard/internships" style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 500 }}>
        ← My Internships
      </Link>

      <h1 style={titleStyle}>Add New Internship</h1>
      <p style={subtitleStyle}>
        This will create a new internship record without affecting any existing ones.
      </p>

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
          <button type="button" style={secondaryButtonStyle}
            onClick={() => router.back()} disabled={saving}>
            Cancel
          </button>
          <button type="submit" style={saving ? disabledButtonStyle : primaryButtonStyle}
            disabled={saving}>
            {saving ? "Creating..." : "Create Internship"}
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
const actionRowStyle = { display: "flex", gap: "12px", marginTop: "12px" };
const buttonBase = { flex: 1, padding: "12px 24px", borderRadius: "999px",
  fontSize: "1rem", fontWeight: "500", cursor: "pointer", boxSizing: "border-box" };
const primaryButtonStyle = { ...buttonBase, color: "var(--surface)", backgroundColor: "var(--accent)", border: "none" };
const secondaryButtonStyle = { ...buttonBase, color: "var(--text-primary)",
  backgroundColor: "var(--surface)", border: "1px solid var(--muted)" };
const disabledButtonStyle = { ...primaryButtonStyle, opacity: 0.5, cursor: "not-allowed" };
