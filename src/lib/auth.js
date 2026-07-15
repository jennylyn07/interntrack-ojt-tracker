// File: src/lib/auth.js
// Purpose: Server-side Better Auth configuration.
//
// This is the single source of truth for authentication.
// It configures:
// - The Prisma adapter (so auth tables live in our existing Postgres DB)
// - The email/password provider (with built-in scrypt hashing)
//
// The Prisma schema uses @@map directives so Better Auth's default
// lowercase table names (user, session, account, verification) are
// matched by our models (User, Session, Account, Verification).
//
// Exported `auth` instance is used by:
// - The catch-all route handler at /api/auth/[...all]
// - Any server-side code that needs to verify a session (auth.api.getSession)

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
