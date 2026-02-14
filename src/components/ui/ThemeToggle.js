"use client";

// File: src/components/ui/ThemeToggle.js
// Purpose: A small client-side control that toggles between light and dark mode.
// Why client component?
// - Theme persistence uses `localStorage` (browser-only).
// - Applying the theme updates the DOM (`document.documentElement.dataset.theme`).
// This keeps the rest of the dashboard as server components while only the
// interactive theme toggle runs on the client.

import { useEffect, useMemo, useState } from "react";
import styles from "./ThemeToggle.module.css";

const THEME_STORAGE_KEY = "ojt-theme";

function getSystemPreferredTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    // If storage is unavailable (privacy mode / restricted env), fall back.
    return null;
  }
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") return;
  // We use a data-attribute so CSS can respond with:
  // :root[data-theme="dark"] { ... }
  document.documentElement.dataset.theme = theme;
}

// Component: ThemeToggle
// Responsibility:
// - Read initial theme (localStorage -> system preference)
// - Apply it to the DOM
// - Persist on change
export default function ThemeToggle() {
  // Initialize state once on the client. We keep this lazy so it doesn't
  // run during server rendering.
  const initialTheme = useMemo(() => {
    return readStoredTheme() ?? getSystemPreferredTheme();
  }, []);

  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Non-blocking; theme still works for this session.
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {/* Teaching note: Simple inline SVG keeps us dependency-free.
          This matches your “feather-style minimal icons” direction. */}
      {isDark ? (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

