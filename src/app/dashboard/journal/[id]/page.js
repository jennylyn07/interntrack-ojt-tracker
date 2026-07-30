// File: src/app/dashboard/journal/[id]/page.js
// Purpose: Full journal entry read view (server component).
//
// Shows: date, mood, title, full content, company tag.
// Actions: Edit (→ /dashboard/journal/[id]/edit) and Delete (inline client island).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import JournalEntryActions from "./JournalEntryActions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const MOOD_META = {
  GREAT:    { emoji: "🌟", label: "Great",    color: "#27ae60" },
  GOOD:     { emoji: "😊", label: "Good",     color: "var(--accent)" },
  OKAY:     { emoji: "😐", label: "Okay",     color: "var(--text-muted)" },
  ROUGH:    { emoji: "😔", label: "Rough",    color: "#d4841a" },
  TERRIBLE: { emoji: "😞", label: "Terrible", color: "#c0392b" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function JournalEntryPage({ params }) {
  const { id } = await params;

  // ── Auth guard ─────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!session.user.emailVerified) redirect("/login?error=email-not-verified");

  // ── Fetch entry with ownership verification ────────────────────────────
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: { internship: { select: { userId: true, company: true } } },
  });

  // 404 if not found or belongs to another user
  if (!entry || entry.internship.userId !== session.user.id) {
    notFound();
  }

  const mood = MOOD_META[entry.mood] ?? MOOD_META.OKAY;

  return (
    <div className={styles.page}>
      {/* Back navigation */}
      <Link href="/dashboard/journal" className={styles.backLink}>
        ← Journal
      </Link>

      <article className={styles.card} aria-label="Journal entry">
        {/* Mood strip */}
        <div
          className={styles.moodStrip}
          style={{ background: mood.color }}
          aria-hidden="true"
        />

        <div className={styles.content}>
          {/* Header metadata */}
          <div className={styles.meta}>
            <div className={styles.metaLeft}>
              <span className={styles.dateBadge}>{formatDate(entry.date)}</span>
              {entry.internship?.company && (
                <span className={styles.companyTag}>🏢 {entry.internship.company}</span>
              )}
            </div>
            <span className={styles.moodBadge} style={{ color: mood.color }}>
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </span>
          </div>

          {/* Title */}
          {entry.title && (
            <h1 className={styles.title}>{entry.title}</h1>
          )}
          {!entry.title && (
            <h1 className={styles.titleUntitled}>Untitled Entry</h1>
          )}

          {/* Full content */}
          <div className={styles.body}>
            {entry.content.split("\n").map((para, i) =>
              para.trim() ? (
                <p key={i}>{para}</p>
              ) : (
                <br key={i} />
              )
            )}
          </div>

          {/* Written at */}
          <p className={styles.writtenAt}>
            Written {new Date(entry.createdAt).toLocaleDateString("en-PH", {
              month: "short", day: "numeric", year: "numeric",
            })}
            {entry.updatedAt > entry.createdAt && " · edited"}
          </p>
        </div>
      </article>

      {/* Edit / Delete actions — client island */}
      <JournalEntryActions entryId={id} />
    </div>
  );
}
