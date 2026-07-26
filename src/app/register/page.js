// File: src/app/register/page.js
// Purpose: Register view — styled to match the app's teal neumorphic design system.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import styles from "./page.module.css";

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
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await authClient.signUp.email({ email, password, name });
      if (authError) {
        setError(authError.message || "Failed to create account");
        setLoading(false);
        return;
      }
      // With requireEmailVerification: true the user isn't signed in yet —
      // show the "check your inbox" state instead of navigating.
      setVerificationSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  const busy = loading || googleLoading;

  // ── Verification pending ───────────────────────────────────────────────────
  if (verificationSent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.wordmark}>OJT Tracker</span>
            <div className={styles.inboxIcon}>📬</div>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.subtitle}>
              We sent a confirmation link to{" "}
              <strong className={styles.emailHighlight}>{email}</strong>.
              Click it to activate your account.
            </p>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              <strong>Didn&apos;t receive it?</strong> Check your spam or junk folder.
              The link expires in 24 hours.
            </p>
          </div>

          <p className={styles.footer}>
            Already verified?{" "}
            <Link href="/login" className={styles.link}>Sign in here</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.wordmark}>OJT Tracker</span>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Sign up to start tracking your internship hours</p>
        </div>

        {/* Google */}
        <button
          id="google-sign-up"
          className={styles.googleBtn}
          onClick={handleGoogleRegister}
          disabled={busy}
          type="button"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>or register with email</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.field}>
            <span className={styles.label}>Full name</span>
            <input
              className={styles.input}
              type="text"
              id="name"
              placeholder="Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={busy}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Email address</span>
            <input
              className={styles.input}
              type="email"
              id="email"
              placeholder="you@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={busy}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirm password</span>
            <input
              className={styles.input}
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={busy}
            />
          </label>

          <button className={styles.submitBtn} type="submit" disabled={busy}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
