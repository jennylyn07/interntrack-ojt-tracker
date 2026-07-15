// File: src/app/dashboard/profile/page.js
// Purpose: Interactive Profile editing and configuration interface.
//
// Features:
// - Fetches existing internships from GET /api/internships.
// - Populates form with existing active internship parameters.
// - Supports PUT updates to modify an existing internship.
// - Supports POST creation if the student has no profile configured yet.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internshipId, setInternshipId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    company: "",
    supervisor: "",
    requiredHours: "",
    startDate: new Date().toISOString().slice(0, 10),
    status: "ACTIVE",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/internships");
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
          const active = data.data.find((item) => item.status === "ACTIVE") || data.data[0];
          setInternshipId(active.id);
          setForm({
            company: active.company || "",
            supervisor: active.supervisor || "",
            requiredHours: active.requiredHours || "",
            startDate: active.startDate ? active.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
            status: active.status || "ACTIVE",
          });
        }
      } catch (err) {
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      company: form.company,
      supervisor: form.supervisor,
      requiredHours: parseInt(form.requiredHours, 10),
      startDate: new Date(form.startDate).toISOString(),
      status: form.status,
    };

    try {
      let res;
      if (internshipId) {
        // Update existing profile
        res = await fetch(`/api/internships/${internshipId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new profile
        res = await fetch("/api/internships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save profile changes.");
        return;
      }

      setSuccess(true);
      if (data.data?.id) {
        setInternshipId(data.data.id);
      }
      
      // Briefly show success before redirecting back
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: "100px auto", textAlign: "center", fontFamily: "sans-serif" }}>
        <p style={{ color: "#666" }}>Loading profile details...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>{internshipId ? "Edit OJT Profile" : "Configure OJT Profile"}</h1>
      <p style={subtitleStyle}>
        Define your OJT program parameters so the dashboard progress updates accurately.
      </p>

      <form onSubmit={handleSubmit} style={formStyle}>
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>Profile saved successfully! Redirecting...</div>}

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="company">Company Name</label>
          <input
            style={inputStyle}
            type="text"
            id="company"
            name="company"
            placeholder="e.g. Acme Tech Solutions"
            value={form.company}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="supervisor">Supervisor Name</label>
          <input
            style={inputStyle}
            type="text"
            id="supervisor"
            name="supervisor"
            placeholder="e.g. Engr. Jane Doe"
            value={form.supervisor}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="requiredHours">Total Required Hours</label>
          <input
            style={inputStyle}
            type="number"
            id="requiredHours"
            name="requiredHours"
            placeholder="e.g. 600"
            min="10"
            max="2000"
            value={form.requiredHours}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="startDate">OJT Start Date</label>
          <input
            style={inputStyle}
            type="date"
            id="startDate"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
            disabled={saving}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="status">Internship Status</label>
          <select
            style={inputStyle}
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            disabled={saving}
          >
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div style={actionRowStyle}>
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={saving ? disabledButtonStyle : primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: "480px",
  margin: "40px auto",
  padding: "0 20px",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  boxSizing: "border-box",
};

const titleStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  marginBottom: "8px",
  letterSpacing: "-0.01em",
};

const subtitleStyle = {
  color: "#666",
  fontSize: "0.95rem",
  marginBottom: "24px",
  lineHeight: "1.4",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#3a3a3c",
};

const inputStyle = {
  padding: "10px 12px",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "1px solid #ddd",
  backgroundColor: "#fff",
  color: "#1c1c1e",
  outline: "none",
  boxSizing: "border-box",
};

const errorStyle = {
  padding: "10px 14px",
  fontSize: "0.85rem",
  fontWeight: "500",
  color: "#ff3b30",
  backgroundColor: "rgba(255, 59, 48, 0.08)",
  borderRadius: "8px",
  border: "1px solid rgba(255, 59, 48, 0.2)",
};

const successStyle = {
  padding: "10px 14px",
  fontSize: "0.85rem",
  fontWeight: "500",
  color: "#34c759",
  backgroundColor: "rgba(52, 199, 89, 0.08)",
  borderRadius: "8px",
  border: "1px solid rgba(52, 199, 89, 0.2)",
};

const actionRowStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "12px",
};

const buttonStyle = {
  flex: 1,
  padding: "12px 24px",
  borderRadius: "999px",
  fontSize: "1rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.15s ease",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  ...buttonStyle,
  color: "#fff",
  backgroundColor: "#1a1a1a",
  border: "none",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  color: "#1c1c1e",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
};

const disabledButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: "#86868b",
  cursor: "not-allowed",
};