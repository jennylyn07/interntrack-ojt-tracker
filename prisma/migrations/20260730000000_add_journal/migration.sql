-- Migration: 20260730000000_add_journal
-- Purpose: Add Mood enum and JournalEntry model for the journal feature.
--
-- JournalEntry references Internship with RESTRICT (no cascade) —
-- matching the same pattern as LogEntry and ChecklistItem.
-- The account-deletion route handles cascade manually in a transaction.

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('GREAT', 'GOOD', 'OKAY', 'ROUGH', 'TERRIBLE');

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mood" "Mood" NOT NULL DEFAULT 'OKAY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntry_internshipId_idx" ON "JournalEntry"("internshipId");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_internshipId_fkey"
    FOREIGN KEY ("internshipId")
    REFERENCES "Internship"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
