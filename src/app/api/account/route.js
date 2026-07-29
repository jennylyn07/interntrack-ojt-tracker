// File: src/app/api/account/route.js
// Purpose: Account management endpoints.
//
// GET  /api/account — returns { hasPassword } so the settings page can show
//                     or hide the Change Password section.
//
// DELETE /api/account — permanently deletes the authenticated user's account.
//
// Why a custom route instead of authClient.deleteUser()?
// The Prisma schema has no onDelete: Cascade on Internship → User,
// LogEntry → Internship, or ChecklistItem → Internship. Better Auth's built-in
// deleteUser calls prisma.user.delete() directly, which Postgres rejects with a
// FK constraint error. This route runs a manual cascade inside a transaction
// first, then deletes the user row (Session and Account DO have Cascade, so
// those rows clean up automatically).

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// ── GET /api/account ─────────────────────────────────────────────────────────
// Returns { hasPassword: boolean } — whether this user has an email/password
// credential (as opposed to Google-only).
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Better Auth stores credential passwords in the Account table under
  // providerId: "credential". If such a row exists with a non-null password,
  // the user registered with email/password.
  const credentialAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "credential" },
    select: { password: true },
  });

  return NextResponse.json({ hasPassword: !!credentialAccount?.password });
}

// ── DELETE /api/account ───────────────────────────────────────────────────────
// Permanently deletes the account and all associated data.
// Body: { password? } — required for email/password accounts; omitted for OAuth.
export async function DELETE(request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // ── Password verification (email/password accounts) ───────────────────────
  const credentialAccount = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
    select: { password: true },
  });

  if (credentialAccount?.password) {
    // User has a local password — require it before deleting.
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete your account." },
        { status: 400 }
      );
    }

    // Use Better Auth's internal verify to check the password.
    const ctx = await auth.api.signInEmail({
      body: { email: session.user.email, password },
      asResponse: true,
    });

    if (ctx.status !== 200) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 403 }
      );
    }
  }

  // ── Cascade-safe deletion ─────────────────────────────────────────────────
  // Delete in dependency order inside a single transaction.
  // LogEntry and ChecklistItem reference Internship (no cascade), so they must
  // go first. Internship references User (no cascade), so it goes next.
  // Session and Account reference User WITH cascade — they clean up automatically
  // when the User row is deleted last.
  await prisma.$transaction([
    // 1. Delete log entries belonging to this user's internships
    prisma.logEntry.deleteMany({
      where: { internship: { userId } },
    }),
    // 2. Delete checklist items belonging to this user's internships
    prisma.checklistItem.deleteMany({
      where: { internship: { userId } },
    }),
    // 3. Delete internships
    prisma.internship.deleteMany({ where: { userId } }),
    // 4. Delete the user row — cascades to Session and Account automatically
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return NextResponse.json({ success: true });
}
