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
      gap: "var(--space-3)",
      textAlign: "center",
      padding: "var(--space-3)",
      animation: "fadeSlideUp 0.35s ease both",
    }}>
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-elevated)",
        maxWidth: 460,
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Warning accent strip */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #e67e22, #c0392b)",
          borderRadius: "var(--radius-pill)",
          marginBottom: "var(--space-3)",
        }} />

        <p style={{ fontSize: "2.2rem", lineHeight: 1, marginBottom: "var(--space-1)" }}>⚠️</p>
        <h2 style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: "var(--space-1)",
          color: "var(--text-primary)",
        }}>
          Something went wrong
        </h2>
        <p style={{
          fontSize: "0.88rem",
          color: "var(--text-muted)",
          lineHeight: 1.65,
          marginBottom: "var(--space-3)",
        }}>
          The dashboard couldn&apos;t load. This is usually a temporary issue —
          try refreshing the page. If the problem persists, check your
          internet connection or try again in a few minutes.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "12px 32px",
            borderRadius: "var(--radius-pill)",
            background: "linear-gradient(135deg, var(--accent-light), var(--accent))",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "0.02em",
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--shadow-accent)",
            fontFamily: "inherit",
            transition: "transform 150ms, box-shadow 260ms",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
