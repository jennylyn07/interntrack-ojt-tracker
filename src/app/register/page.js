// File: src/app/register/page.js
// Purpose: Premium Register view using Better Auth client-side hooks.
//
// Style guide:
// - Matches /login design language (HSL-tailored colors, glassmorphism, responsive).
// - Confirms password match before calling API.
//
// Auth paths:
// - Google OAuth: one click, email pre-verified by Google, redirects immediately to dashboard.
// - Email + password: after sign-up, shows a "check your inbox" state instead of
//   redirecting to dashboard. The user must click the confirmation link in their
//   email before they can sign in. This prevents fake/unreachable email addresses
//   from ever gaining access.

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  async function handleGoogleRegister() {
    setError("");
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      // Navigation handled by Better Auth's OAuth redirect.
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

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

      // Registration succeeded. With requireEmailVerification: true, the user
      // is NOT yet signed in — they must click the link in their email first.
      // Show the "check your inbox" state instead of navigating to /dashboard.
      setVerificationSent(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  // ── Verification pending state ─────────────────────────────────────────────
  if (verificationSent) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <p style={logoStyle}>OJT Tracker</p>
            <div style={{ fontSize: "2.5rem", margin: "4px 0" }}>📬</div>
            <h1 style={titleStyle}>Check your inbox</h1>
            <p style={subtitleStyle}>
              We sent a confirmation link to{" "}
              <strong style={{ color: "var(--foreground, #1c1c1e)" }}>{email}</strong>.
              Click it to activate your account.
            </p>
          </div>
          <div style={infoBoxStyle}>
            <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.6, color: "#48484a" }}>
              <strong>Didn&apos;t receive it?</strong> Check your spam or junk folder. The link
              expires in 24 hours.
            </p>
          </div>
          <div style={footerStyle}>
            <p>
              Already verified?{" "}
              <Link href="/login" style={linkStyle}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <p style={logoStyle}>OJT Tracker</p>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>Sign up to start tracking your internship hours</p>
        </div>

        {/* ── Google sign-up ── */}
        <button
          id="google-sign-up"
          style={googleLoading ? { ...googleButtonStyle, opacity: 0.7, cursor: "not-allowed" } : googleButtonStyle}
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          type="button"
        >
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
          <span style={dividerTextStyle}>or register with email</span>
          <span style={dividerLineStyle} />
        </div>

        {/* ── Email + password form ── */}
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
              disabled={loading || googleLoading}
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
              disabled={loading || googleLoading}
            />
          </div>

          <button
            style={loading ? disabledButtonStyle : buttonStyle}
            type="submit"
            disabled={loading || googleLoading}
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
  lineHeight: "1.5",
};

const infoBoxStyle = {
  background: "rgba(0, 113, 227, 0.06)",
  border: "1px solid rgba(0, 113, 227, 0.15)",
  borderRadius: "10px",
  padding: "14px 16px",
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
