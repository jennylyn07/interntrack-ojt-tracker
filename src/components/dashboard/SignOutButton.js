// File: src/components/dashboard/SignOutButton.js
// Purpose: Interactive sign-out button (Client Component).
//
// Using a separate client component allows the DashboardHeader itself
// to remain a clean, server-side rendered component.

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
      style={buttonStyle}
      aria-label="Sign Out"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}

const buttonStyle = {
  padding: "8px 14px",
  fontSize: "0.85rem",
  fontWeight: "600",
  borderRadius: "20px",
  border: "1px solid var(--border-color, #e5e5ea)",
  backgroundColor: "var(--card-bg, #ffffff)",
  color: "var(--foreground, #1c1c1e)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
};
