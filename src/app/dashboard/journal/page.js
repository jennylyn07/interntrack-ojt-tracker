// File: src/app/dashboard/journal/page.js
// Purpose: Journal list page (server component).
//
// Fetches:
//   - Session (redirects to /login if missing or unverified)
//   - Active internship for scoping the journal query
//   - All journal entries for that internship, newest-first
//
// Renders a responsive grid of JournalCard components, or a beautiful
// empty state with a "Write your first entry" prompt.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import JournalCard from "@/components/dashboard/JournalCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal — InternTrack",
  description: "Your personal internship journal. Reflect on your daily experiences, learnings, and feelings.",
};

export default async function JournalPage() {
  // ── Auth guard ───────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!session.user.emailVerified) redirect("/login?error=email-not-verified");

  // ── Fetch active internship ──────────────────────────────────────────────
  const internship = await prisma.internship.findFirst({
    where: { userId: session.user.id, status: "ACTIVE", archived: false },
    orderBy: { startDate: "desc" },
    select: { id: true, company: true },
  });

  // ── Fetch journal entries ────────────────────────────────────────────────
  let entries = [];
  if (internship) {
    entries = await prisma.journalEntry.findMany({
      where: { internshipId: internship.id },
      orderBy: { date: "desc" },
      include: {
        internship: { select: { company: true } },
      },
    });
  }

  const hasEntries = entries.length > 0;

  return (
    <div className={styles.page}>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Dashboard
        </Link>

        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleIcon}>📓</span> Journal
            </h1>
            <p className={styles.pageSubtitle}>
              {hasEntries
                ? `${entries.length} entr${entries.length === 1 ? "y" : "ies"} — your personal internship reflections`
                : "A private space to reflect on your internship journey"}
            </p>
          </div>

          {internship && (
            <Link href="/dashboard/journal/new" className={styles.newBtn} id="journal-new-entry">
              + New Entry
            </Link>
          )}
        </div>
      </div>

      {/* ── No active internship ──────────────────────────────────────────── */}
      {!internship && (
        <div className={styles.emptyCard}>
          <p className={styles.emptyTitle}>No active internship</p>
          <p className={styles.emptyBody}>
            Set up your internship profile first so your journal entries can be
            linked to it.
          </p>
          <Link href="/dashboard/internships/new" className={styles.emptyAction}>
            Set up internship →
          </Link>
        </div>
      )}

      {/* ── Empty state — internship exists but no entries yet ────────────── */}
      {internship && !hasEntries && (
        <div className={styles.emptyCard}>
          <div className={styles.emptyEmoji}>📝</div>
          <p className={styles.emptyTitle}>No entries yet</p>
          <p className={styles.emptyBody}>
            Your journal is a private space — write about what you learned today,
            how you felt, challenges you overcame, or anything on your mind.
          </p>
          <Link href="/dashboard/journal/new" className={styles.emptyAction}>
            Write your first entry →
          </Link>
        </div>
      )}

      {/* ── Entry list ────────────────────────────────────────────────────── */}
      {hasEntries && (
        <div className={styles.grid}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <JournalCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
