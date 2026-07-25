-- ONE-TIME MIGRATION: run in Neon console SQL editor BEFORE deploying email verification.
-- Marks all pre-existing accounts as verified so they are not locked out.

UPDATE "user" SET "emailVerified" = true;
