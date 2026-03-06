/*
  Warnings:

  - You are about to drop the column `userId` on the `ChecklistItem` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the `OJTProfile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `internshipId` to the `ChecklistItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internshipId` to the `LogEntry` table without a default value. This is not possible if the table is not empty.

*/
--
-- Data-preserving refactor:
-- 1) Create Internship table
-- 2) Add nullable internshipId columns to dependent tables
-- 3) Backfill internshipId from existing OJTProfile + userId
-- 4) Enforce NOT NULL + drop old columns/table
--

-- Ensure UUID generator is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "Internship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "requiredHours" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable (add nullable first so existing rows don't break)
ALTER TABLE "LogEntry" ADD COLUMN "internshipId" TEXT;
ALTER TABLE "ChecklistItem" ADD COLUMN "internshipId" TEXT;

-- Backfill Internship rows from existing OJTProfile.
-- We reuse OJTProfile.id as Internship.id to make mapping deterministic.
INSERT INTO "Internship" ("id", "userId", "company", "supervisor", "requiredHours", "startDate", "endDate", "status")
SELECT "id", "userId", "company", "supervisor", "requiredHours", "startDate", "endDate", 'active'
FROM "OJTProfile";

-- Backfill internshipId on dependent tables by matching userId.
-- Because OJTProfile.userId was unique, each user maps to exactly one Internship from existing data.
UPDATE "LogEntry" l
SET "internshipId" = i."id"
FROM "Internship" i
WHERE l."userId" = i."userId";

UPDATE "ChecklistItem" c
SET "internshipId" = i."id"
FROM "Internship" i
WHERE c."userId" = i."userId";

-- If there are rows for users who never had an OJTProfile, create one internship per user.
-- (Prevents NOT NULL failure when enforcing constraints.)
INSERT INTO "Internship" ("id", "userId", "company", "supervisor", "requiredHours", "startDate", "endDate", "status")
SELECT gen_random_uuid()::text, u."id", '', '', 0, NOW(), NULL, 'active'
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Internship" i WHERE i."userId" = u."id"
);

UPDATE "LogEntry" l
SET "internshipId" = i."id"
FROM "Internship" i
WHERE l."internshipId" IS NULL AND l."userId" = i."userId";

UPDATE "ChecklistItem" c
SET "internshipId" = i."id"
FROM "Internship" i
WHERE c."internshipId" IS NULL AND c."userId" = i."userId";

-- Drop old FK constraints tied to userId
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_userId_fkey";
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_userId_fkey";
ALTER TABLE "OJTProfile" DROP CONSTRAINT "OJTProfile_userId_fkey";

-- Enforce NOT NULL + add new foreign keys
ALTER TABLE "LogEntry" ALTER COLUMN "internshipId" SET NOT NULL;
ALTER TABLE "ChecklistItem" ALTER COLUMN "internshipId" SET NOT NULL;

ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop legacy columns/table
ALTER TABLE "LogEntry" DROP COLUMN "userId";
ALTER TABLE "ChecklistItem" DROP COLUMN "userId";
DROP TABLE "OJTProfile";
