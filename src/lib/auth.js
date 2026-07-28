// File: src/lib/auth.js
// Purpose: Server-side Better Auth configuration.
//
// This is the single source of truth for authentication.
// It configures:
// - The Prisma adapter (so auth tables live in our existing Postgres DB)
// - Email/password provider with email verification (via Resend)
// - Google OAuth (social provider)
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
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  // Explicitly set the base URL so Better Auth doesn't have to auto-detect
  // it from request headers at serverless cold-start — silent detection
  // failures there cause getSession() to return null even with a valid cookie.
  baseURL: process.env.BETTER_AUTH_URL,

  // Allow requests from both local dev and production deployments.
  // Without this, setting BETTER_AUTH_URL to one origin rejects the other.
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://intern-track-ojt-tracker.vercel.app",
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Social login ──────────────────────────────────────────────────────────
  // Google OAuth. Client ID and secret come from Google Cloud Console.
  // Callback URL registered there must match:
  //   http://localhost:3000/api/auth/callback/google   (local dev)
  //   https://intern-track-ojt-tracker.vercel.app/api/auth/callback/google  (production)
  //
  // Google accounts are already email-verified by Google, so users who sign in
  // via this path are immediately active (no confirmation email sent to them).
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Force the account picker on every sign-in attempt.
      // Without this, Google silently reuses whatever account is already
      // active in the browser session — no picker shown at all.
      // "select_account" is a standard OIDC prompt value; Google honours it.
      prompt: "select_account",
    },
  },

  // ── Email + password ──────────────────────────────────────────────────────
  // requireEmailVerification: new registrations must click the link in their
  // inbox before they can sign in. Existing accounts registered before this
  // feature was enabled must have emailVerified set to true in the DB first
  // (see scripts/mark-existing-users-verified.sql).
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // ── Verification email ────────────────────────────────────────────────────
  // Called automatically by Better Auth when a new email/password account is
  // created. The `url` argument is a short-lived signed link that activates
  // the account when clicked.
  //
  // Sender address: change "onboarding@resend.dev" to your own verified domain
  // once you add one in the Resend dashboard. The default works for testing.
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "OJT Tracker <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your OJT Tracker email address",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #ffffff;">
            <p style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
                      letter-spacing: 0.15em; color: #0071e3; margin: 0 0 24px;">
              OJT Tracker
            </p>
            <h1 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a;
                       margin: 0 0 12px; letter-spacing: -0.02em;">
              Verify your email
            </h1>
            <p style="color: #48484a; margin: 0 0 8px; line-height: 1.5;">
              Hi ${user.name || "there"},
            </p>
            <p style="color: #48484a; margin: 0 0 28px; line-height: 1.5;">
              Click the button below to confirm your email address and activate your OJT Tracker account.
            </p>
            <a href="${url}"
               style="display: inline-block; padding: 12px 28px; background: #1a1a1a;
                      color: #ffffff; text-decoration: none; border-radius: 8px;
                      font-weight: 600; font-size: 0.95rem;">
              Verify email address
            </a>
            <p style="color: #86868b; font-size: 0.8rem; margin: 28px 0 0; line-height: 1.5;">
              If you didn&apos;t create an OJT Tracker account, you can safely ignore this email.<br/>
              This link expires in 24 hours.
            </p>
          </div>
        `,
      });
    },
  },
});
