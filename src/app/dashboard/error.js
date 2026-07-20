"use client";

// File: src/app/dashboard/error.js
// Purpose: Error boundary for the dashboard route.
//
// Next.js App Router automatically shows this when the dashboard server
// component throws an unhandled error (e.g. database unreachable).
//
// Must be a Client Component ("use client") — Next.js requires this
// for error boundaries so they can receive the error prop and expose
// the reset() function for retry.

import { useEffect } from "react";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log to the browser console in development so the full stack is visible.
    console.error("[DashboardError boundary]", error);
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: "1.5rem",
      textAlign: "center",
      padding: "2rem",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--muted)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-soft-outer)",
        maxWidth: 440,
        width: "100%",
      }}>
        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</p>
        <h2 style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--text-primary)",
        }}>
          Something went wrong
        </h2>
        <p style={{
          fontSize: "0.95rem",
          color: "var(--accent)",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}>
          The dashboard couldn&apos;t load. This is usually a temporary issue —
          try refreshing the page. If the problem keeps happening, check your
          internet connection or try again in a few minutes.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px",
            borderRadius: 999,
            background: "var(--accent)",
            color: "var(--surface)",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
