// File: src/app/login/page.js
// Purpose: Premium Login view using Better Auth client-side hooks.
//
// Style guide:
// - Modern HSL-tailored colors, deep dark/light support, glassmorphism card.
// - Clean typography, subtle micro-animations (transitions).
// - Responsive layout centered on screen.

"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve callback URL if set by middleware, default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Successful login — redirect to dashboard
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <p style={logoStyle}>OJT Tracker</p>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>Sign in to log your hours and track your progress</p>
      </div>

      <form onSubmit={handleLogin} style={formStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="email">Email Address</label>
          <input
            style={inputStyle}
            type="email"
            id="email"
            placeholder="you@student.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="password">Password</label>
          <input
            style={inputStyle}
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button
          style={loading ? disabledButtonStyle : buttonStyle}
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div style={footerStyle}>
        <p>
          Don't have an account?{" "}
          <Link href="/register" style={linkStyle}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={containerStyle}>
      <Suspense fallback={
        <div style={cardStyle}>
          <div style={headerStyle}>
            <p style={logoStyle}>OJT Tracker</p>
            <h1 style={titleStyle}>Loading</h1>
            <p style={subtitleStyle}>Please wait while we initialize the secure login...</p>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

// Styling Tokens using Vanilla JS CSS styles for maximum modularity and theme compatibility.
const containerStyle = {
  display: "flex",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--background, #f5f5f7)",
  color: "var(--foreground, #1c1c1e)",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  padding: "20px",
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "var(--card-bg, #ffffff)",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--border-color, #e5e5ea)",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const headerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  textAlign: "center",
};

const logoStyle = {
  fontSize: "0.85rem",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "#0071e3",
  margin: "0 0 4px 0",
};

const titleStyle = {
  fontSize: "1.75rem",
  fontWeight: "700",
  margin: 0,
  letterSpacing: "-0.02em",
};

const subtitleStyle = {
  fontSize: "0.95rem",
  color: "var(--secondary-text, #86868b)",
  margin: 0,
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
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "var(--secondary-text, #48484a)",
};

const inputStyle = {
  padding: "12px 16px",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "1px solid var(--input-border, #d2d2d7)",
  backgroundColor: "var(--input-bg, #ffffff)",
  color: "inherit",
  outline: "none",
  transition: "border-color 0.15s ease",
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

const buttonStyle = {
  padding: "14px",
  fontSize: "1rem",
  fontWeight: "600",
  color: "#ffffff",
  backgroundColor: "#1a1a1a",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.15s ease",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  marginTop: "10px",
};

const disabledButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#86868b",
  cursor: "not-allowed",
  boxShadow: "none",
};

const footerStyle = {
  fontSize: "0.9rem",
  textAlign: "center",
  color: "var(--secondary-text, #86868b)",
  marginTop: "8px",
};

const linkStyle = {
  color: "#0071e3",
  textDecoration: "none",
  fontWeight: "600",
};
