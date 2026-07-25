// File: src/app/login/page.js
// Purpose: Premium Login view using Better Auth client-side hooks.
//
// Style guide:
// - Modern HSL-tailored colors, deep dark/light support, glassmorphism card.
// - Clean typography, subtle micro-animations (transitions).
// - Responsive layout centered on screen.
//
// Auth paths:
// - Google OAuth: one click, no password, email pre-verified by Google.
// - Email + password: requires emailVerified=true (verified via confirmation email).

"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Retrieve callback URL if set by proxy, default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
      // Navigation is handled by Better Auth's OAuth redirect — no router.push needed.
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

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

      // Successful login — navigate to dashboard.
      // Do NOT call router.refresh() here: it fires before the push navigation
      // settles and re-renders the current page server-side with stale headers,
      // causing getSession() to return null and bounce back to /login.
      router.push(callbackUrl);
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

      {/* ── Google sign-in ── */}
      <button
        id="google-sign-in"
        style={googleLoading ? { ...googleButtonStyle, opacity: 0.7, cursor: "not-allowed" } : googleButtonStyle}
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        type="button"
      >
        {/* Google multicolor G icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
      </button>

      {/* ── OR divider ── */}
      <div style={dividerStyle}>
        <span style={dividerLineStyle} />
        <span style={dividerTextStyle}>or sign in with email</span>
        <span style={dividerLineStyle} />
      </div>

      {/* ── Email + password form ── */}
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
            disabled={loading || googleLoading}
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
            disabled={loading || googleLoading}
          />
        </div>

        <button
          style={loading ? disabledButtonStyle : buttonStyle}
          type="submit"
          disabled={loading || googleLoading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div style={footerStyle}>
        <p>
          Don&apos;t have an account?{" "}
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

// ── Styles ────────────────────────────────────────────────────────────────────

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
  gap: "20px",
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

const googleButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "12px 16px",
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "#3c4043",
  backgroundColor: "#ffffff",
  border: "1px solid #dadce0",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background-color 0.15s ease, box-shadow 0.15s ease",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  width: "100%",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const dividerLineStyle = {
  flex: 1,
  height: "1px",
  backgroundColor: "var(--border-color, #e5e5ea)",
};

const dividerTextStyle = {
  fontSize: "0.8rem",
  color: "var(--secondary-text, #86868b)",
  whiteSpace: "nowrap",
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
  marginTop: "4px",
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
  marginTop: "4px",
};

const linkStyle = {
  color: "#0071e3",
  textDecoration: "none",
  fontWeight: "600",
};
