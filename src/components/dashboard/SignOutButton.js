// File: src/components/dashboard/SignOutButton.js
// Purpose: Interactive sign-out button (Client Component).

"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          }
        }
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={loading ? { ...buttonStyle, opacity: 0.55, cursor: "not-allowed" } : buttonStyle}
      aria-label="Sign Out"
    >
      {loading ? "Signing out…" : "Sign Out"}
    </button>
  );
}

const buttonStyle = {
  padding: "10px 18px",
  fontSize: "0.82rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  borderRadius: "var(--radius-lg)",
  border: 0,
  backgroundColor: "var(--surface)",
  color: "var(--accent)",
  cursor: "pointer",
  transition: "transform 150ms, box-shadow 260ms",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  boxShadow: "var(--shadow-soft-outer)",
  fontFamily: "inherit",
  minHeight: 44,
};

