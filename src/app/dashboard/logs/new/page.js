// File: src/app/dashboard/logs/new/page.js
// Purpose: Form page for adding a new daily log entry.
// Phase 6: Basic form that calls POST /api/logs
// Phase 7: Will use real session userId instead of TEMP_USER_ID

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// TEMPORARY: Replace this in Phase 7 with real session userId
// ============================================================
const TEMP_INTERNSHIP_ID = "cmnk39q1h0000ac9086iu1u88";

export default function NewLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    hours: "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: TEMP_INTERNSHIP_ID,
          date: new Date(form.date).toISOString(),
          description: form.description,
          hours: parseFloat(form.hours),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      // Success — go back to dashboard
      router.push("/dashboard");
      router.refresh(); // refresh server data

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ marginBottom: 24, fontSize: "1.4rem", fontWeight: 650 }}>
        Add Daily Log
      </h1>

      <form onSubmit={handleSubmit}>

        {/* Date */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Hours */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Hours worked
          </label>
          <input
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
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            What did you do today?
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your tasks, learnings, and accomplishments..."
            required
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Error message */}
        {error && (
          <p style={{ color: "red", marginBottom: 16, fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={primaryButtonStyle}
          >
            {loading ? "Saving..." : "Save Log"}
          </button>
        </div>

      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  flex: 1,
  padding: "12px 24px",
  borderRadius: 999,
  border: 0,
  background: "#1a1a1a",
  color: "#fff",
  fontSize: "1rem",
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  flex: 1,
  padding: "12px 24px",
  borderRadius: 999,
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};