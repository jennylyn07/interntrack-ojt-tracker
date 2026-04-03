/*
  Warnings:

  - The `status` column on the `Internship` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Internship" DROP COLUMN "status",
ADD COLUMN     "status" "InternshipStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "ChecklistItem_internshipId_idx" ON "ChecklistItem"("internshipId");

-- CreateIndex
CREATE INDEX "Internship_userId_idx" ON "Internship"("userId");

-- CreateIndex
CREATE INDEX "LogEntry_internshipId_idx" ON "LogEntry"("internshipId");
