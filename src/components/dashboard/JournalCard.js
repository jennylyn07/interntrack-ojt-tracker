// File: src/components/dashboard/JournalCard.js
// Purpose: Preview card for a single journal entry shown in the list view.
//
// Props:
//   entry: {
//     id, date, title, content, mood,
//     internship: { company }
//   }

import Link from "next/link";
import styles from "./JournalCard.module.css";

// Mood metadata: emoji, human label, CSS modifier class
const MOOD_META = {
  GREAT:    { emoji: "🌟", label: "Great",    mod: "great" },
  GOOD:     { emoji: "😊", label: "Good",     mod: "good" },
  OKAY:     { emoji: "😐", label: "Okay",     mod: "okay" },
  ROUGH:    { emoji: "😔", label: "Rough",    mod: "rough" },
  TERRIBLE: { emoji: "😞", label: "Terrible", mod: "terrible" },
};

// Nicely format a stored ISO date string as "Mon DD, YYYY"
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// Truncate content preview to N characters
function truncate(str, max = 140) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

export default function JournalCard({ entry }) {
  const mood = MOOD_META[entry.mood] ?? MOOD_META.OKAY;

  return (
    <Link
      href={`/dashboard/journal/${entry.id}`}
      className={`${styles.card} ${styles[`mood_${mood.mod}`]}`}
      aria-label={`Journal entry: ${entry.title || "Untitled"} — ${formatDate(entry.date)}`}
    >
      {/* Mood accent strip (left border) */}
      <span className={styles.moodStrip} aria-hidden="true" />

      <div className={styles.body}>
        {/* Top row: date badge + mood chip */}
        <div className={styles.topRow}>
          <span className={styles.dateBadge}>{formatDate(entry.date)}</span>
          <span className={styles.moodChip}>
            <span className={styles.moodEmoji}>{mood.emoji}</span>
            <span className={styles.moodLabel}>{mood.label}</span>
          </span>
        </div>

        {/* Title */}
        {entry.title && (
          <p className={styles.title}>{entry.title}</p>
        )}

        {/* Content preview */}
        <p className={styles.preview}>{truncate(entry.content)}</p>

        {/* Footer: company tag + read-more hint */}
        <div className={styles.footer}>
          {entry.internship?.company && (
            <span className={styles.companyTag}>🏢 {entry.internship.company}</span>
          )}
          <span className={styles.readMore}>Read →</span>
        </div>
      </div>
    </Link>
  );
}
