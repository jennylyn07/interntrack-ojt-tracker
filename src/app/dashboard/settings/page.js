// File: src/app/dashboard/settings/page.js
// Purpose: Account management settings page.
//
// Sections:
//   1. Profile     — update display name via authClient.updateUser()
//   2. Security    — change password via authClient.changePassword()
//                    (hidden for Google-only / OAuth-only accounts)
//   3. Danger Zone — delete account via DELETE /api/account (custom route)
//                    Email/password users must supply current password.
//                    Google-only users must type "DELETE" to confirm.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // ── Account type (password vs OAuth-only) ─────────────────────────────────
  const [hasPassword, setHasPassword] = useState(null); // null = loading

  useEffect(() => {
    if (!session) return;
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => setHasPassword(d.hasPassword ?? false))
      .catch(() => setHasPassword(false));
  }, [session]);

  // ── Profile section state ─────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Seed name from session once loaded
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileError("");
    setProfileSuccess(false);
    setProfileLoading(true);
    const { error } = await authClient.updateUser({ name: name.trim() });
    setProfileLoading(false);
    if (error) {
      setProfileError(error.message || "Failed to update name.");
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  }

  // ── Password section state ────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPwLoading(false);
    if (error) {
      setPwError(error.message || "Failed to change password.");
    } else {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPwSuccess(false), 4000);
    }
  }

  // ── Delete account state ──────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function openDeleteModal() {
    setDeletePassword("");
    setDeleteConfirmText("");
    setDeleteError("");
    setShowDeleteModal(true);
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteError("");

    // Validate confirmation input
    if (hasPassword && !deletePassword) {
      setDeleteError("Enter your current password to confirm deletion.");
      return;
    }
    if (!hasPassword && deleteConfirmText !== "DELETE") {
      setDeleteError('Type "DELETE" (all caps) to confirm.');
      return;
    }

    setDeleteLoading(true);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hasPassword ? { password: deletePassword } : {}),
    });
    const data = await res.json();

    if (!res.ok) {
      setDeleteLoading(false);
      setDeleteError(data.error || "Deletion failed. Please try again.");
      return;
    }

    // Account deleted — sign out client-side and redirect
    await authClient.signOut();
    router.push("/login");
  }

  // ── Guard: session still loading ─────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingShell}>
          <p className={styles.loadingText}>Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Dashboard
        </Link>
        <h1 className={styles.pageTitle}>Account Settings</h1>
        <p className={styles.pageSubtitle}>
          Manage your profile, security, and account data.
        </p>
      </div>

      <div className={styles.sections}>

        {/* ── Section 1: Profile ──────────────────────────────────────────── */}
        <section className={styles.card} aria-labelledby="profile-heading">
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon} aria-hidden="true">👤</span>
            <div>
              <h2 id="profile-heading" className={styles.cardTitle}>Profile</h2>
              <p className={styles.cardDesc}>Update your display name.</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className={styles.form}>
            <label className={styles.field}>
              <span className={styles.label}>Display name</span>
              <input
                id="settings-name"
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={profileLoading}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email address</span>
              <input
                className={`${styles.input} ${styles.inputReadonly}`}
                type="email"
                value={session?.user?.email ?? ""}
                readOnly
                disabled
                title="Email change is not available yet"
              />
              <span className={styles.hint}>Email changes coming soon.</span>
            </label>

            {profileError && <p className={styles.error}>{profileError}</p>}
            {profileSuccess && (
              <p className={styles.success}>✓ Name updated successfully.</p>
            )}

            <button
              id="settings-save-profile"
              className={styles.saveBtn}
              type="submit"
              disabled={profileLoading}
            >
              {profileLoading ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        {/* ── Section 2: Security (password accounts only) ─────────────── */}
        {hasPassword && (
          <section className={styles.card} aria-labelledby="security-heading">
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon} aria-hidden="true">🔒</span>
              <div>
                <h2 id="security-heading" className={styles.cardTitle}>Security</h2>
                <p className={styles.cardDesc}>
                  Change your password. Other active sessions will be signed out.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className={styles.form}>
              <label className={styles.field}>
                <span className={styles.label}>Current password</span>
                <input
                  id="settings-current-password"
                  className={styles.input}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={pwLoading}
                  autoComplete="current-password"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>New password</span>
                <input
                  id="settings-new-password"
                  className={styles.input}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={pwLoading}
                  autoComplete="new-password"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Confirm new password</span>
                <input
                  id="settings-confirm-password"
                  className={styles.input}
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={pwLoading}
                  autoComplete="new-password"
                />
              </label>

              {pwError && <p className={styles.error}>{pwError}</p>}
              {pwSuccess && (
                <p className={styles.success}>
                  ✓ Password changed. Other sessions have been signed out.
                </p>
              )}

              <button
                id="settings-change-password"
                className={styles.saveBtn}
                type="submit"
                disabled={pwLoading}
              >
                {pwLoading ? "Updating…" : "Change password"}
              </button>
            </form>
          </section>
        )}

        {/* ── Section 3: Danger Zone ──────────────────────────────────── */}
        <section
          className={`${styles.card} ${styles.dangerCard}`}
          aria-labelledby="danger-heading"
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon} aria-hidden="true">⚠️</span>
            <div>
              <h2 id="danger-heading" className={styles.cardTitle}>Danger Zone</h2>
              <p className={styles.cardDesc}>
                Permanently delete your account and all your data — logs,
                checklists, and internship records. This cannot be undone.
              </p>
            </div>
          </div>

          <button
            id="settings-delete-account"
            className={styles.deleteBtn}
            type="button"
            onClick={openDeleteModal}
          >
            Delete my account
          </button>
        </section>
      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon} aria-hidden="true">🗑️</span>
              <h2 id="delete-modal-title" className={styles.modalTitle}>
                Delete account?
              </h2>
              <p className={styles.modalDesc}>
                This will permanently delete your account, all log entries,
                checklists, and internship records.{" "}
                <strong>There is no undo.</strong>
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className={styles.form}>
              {hasPassword ? (
                <label className={styles.field}>
                  <span className={styles.label}>
                    Enter your password to confirm
                  </span>
                  <input
                    id="delete-password-confirm"
                    className={styles.input}
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    disabled={deleteLoading}
                    autoComplete="current-password"
                  />
                </label>
              ) : (
                <label className={styles.field}>
                  <span className={styles.label}>
                    Type <strong>DELETE</strong> to confirm
                  </span>
                  <input
                    id="delete-text-confirm"
                    className={styles.input}
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    required
                    autoFocus
                    disabled={deleteLoading}
                    autoComplete="off"
                  />
                </label>
              )}

              {deleteError && (
                <p className={styles.error}>{deleteError}</p>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  id="delete-account-confirm"
                  type="submit"
                  className={styles.confirmDeleteBtn}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting…" : "Yes, delete permanently"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
