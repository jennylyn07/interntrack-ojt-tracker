// File: src/app/login/page.js
// Purpose: Login view — styled to match the app's teal neumorphic design system.

"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import styles from "./page.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: callbackUrl });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) {
        setError(authError.message || "Invalid email or password");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <div className={styles.card}>
      {/* Neomorphic logo mark */}
      <div className={styles.logoMark}>
        <div className={styles.logoCircle} aria-hidden="true">🎓</div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.wordmark}>OJT Tracker</span>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to log your hours and track your progress</p>
      </div>

      {/* Google */}
      <button
        id="google-sign-in"
        className={styles.googleBtn}
        onClick={handleGoogleLogin}
        disabled={busy}
        type="button"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerLabel}>or sign in with email</span>
        <span className={styles.dividerLine} />
      </div>

      {/* Email form */}
      <form onSubmit={handleLogin} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}

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

        <button className={styles.submitBtn} type="submit" disabled={busy}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className={styles.link}>Register here</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.wordmark}>OJT Tracker</span>
            <h1 className={styles.title}>Loading…</h1>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
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
