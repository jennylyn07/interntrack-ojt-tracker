// File: src/app/register/page.js
// Purpose: Premium Register view using Better Auth client-side hooks.
//
// Style guide:
// - Matches /login design language (HSL-tailored colors, glassmorphism, responsive).
// - Confirms password match before calling API.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    // Client-side validation: Passwords must match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        setError(authError.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // Successful registration & auto login — redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <p style={logoStyle}>OJT Tracker</p>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>Sign up to start tracking your internship hours</p>
        </div>

        <form onSubmit={handleRegister} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="name">Full Name</label>
            <input
              style={inputStyle}
              type="text"
              id="name"
              placeholder="Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="confirmPassword">Confirm Password</label>
            <input
              style={inputStyle}
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            style={loading ? disabledButtonStyle : buttonStyle}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div style={footerStyle}>
          <p>
            Already have an account?{" "}
            <Link href="/login" style={linkStyle}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Styling Tokens using Vanilla JS CSS styles (matches /login exactly)
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
