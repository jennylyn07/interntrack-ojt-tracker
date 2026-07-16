-- Migration: add_better_auth
-- This migration captures changes applied via `prisma db push` during the
-- Better Auth integration. It is safe to mark as applied without re-running
-- because all DDL below has already been executed against the live database.
--
-- Changes from migration history baseline → current schema.prisma:
--   1. Rename "User" → "user" (@@map("user") added)
--   2. Alter "user": make password nullable, add name / emailVerified / image
--   3. Update "Internship" FK to reference "user"
--   4. Create "session", "account", "verification" tables + indexes

-- ─── Step 1: Rename User → user ─────────────────────────────────────────────
-- Drop the old unique-index so we can rename cleanly; it gets recreated below.
DROP INDEX IF EXISTS "User_email_key";

ALTER TABLE "User" RENAME TO "user";

-- Rename the primary key constraint to match Prisma expectations
ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";

-- ─── Step 2: Alter "user" table ──────────────────────────────────────────────
-- make password nullable (Better Auth allows OAuth users with no password)
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;

-- add Better Auth fields
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "name"          TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "image"         TEXT;

-- Recreate email unique index under the new Prisma-generated name
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");

-- ─── Step 3: Update Internship FK to reference "user" ────────────────────────
ALTER TABLE "Internship" DROP CONSTRAINT IF EXISTS "Internship_userId_fkey";
ALTER TABLE "Internship"
  ADD CONSTRAINT "Internship_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Step 4: Create "session" table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "session" (
    "id"        TEXT        NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token"     TEXT        NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId"    TEXT        NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");
CREATE INDEX IF NOT EXISTS "session_userId_idx"       ON "session"("userId");

ALTER TABLE "session"
  ADD CONSTRAINT "session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Step 5: Create "account" table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "account" (
    "id"                    TEXT        NOT NULL,
    "accountId"             TEXT        NOT NULL,
    "providerId"            TEXT        NOT NULL,
    "userId"                TEXT        NOT NULL,
    "accessToken"           TEXT,
    "refreshToken"          TEXT,
    "idToken"               TEXT,
    "accessTokenExpiresAt"  TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope"                 TEXT,
    "password"              TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");

ALTER TABLE "account"
  ADD CONSTRAINT "account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Step 6: Create "verification" table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "verification" (
    "id"         TEXT        NOT NULL,
    "identifier" TEXT        NOT NULL,
    "value"      TEXT        NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");
