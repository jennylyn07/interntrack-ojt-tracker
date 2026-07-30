// File: src/app/api/journal/[id]/route.js
// Purpose: Single journal entry — read, update, delete.
//
// GET    /api/journal/[id] — fetch one entry (ownership check)
// PUT    /api/journal/[id] — update title, content, mood
// DELETE /api/journal/[id] — remove permanently
//
// IDOR protection: every handler looks up the entry via
//   internship.userId === session.user.id
// so a user can never operate on another user's entries.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ── Zod schema for updates ────────────────────────────────────────────────────
const updateJournalSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1, "Content is required").optional(),
  mood: z.enum(["GREAT", "GOOD", "OKAY", "ROUGH", "TERRIBLE"]).optional(),
  date: z.string().datetime("Invalid date format").optional(),
});

// ── Helper — fetch entry with ownership info ──────────────────────────────────
async function getEntryForUser(id) {
  return await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      internship: { select: { userId: true, company: true } },
    },
  });
}

// ── GET /api/journal/[id] ─────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const entry = await getEntryForUser(id);

    if (!entry || entry.internship.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("[GET /api/journal/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entry" },
      { status: 500 }
    );
  }
}

// ── PUT /api/journal/[id] ─────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validation = updateJournalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Ownership check
    const existing = await getEntryForUser(id);
    if (!existing || existing.internship.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...validation.data,
        // Ensure title is stored as null when explicitly cleared
        title: validation.data.title === undefined
          ? undefined
          : (validation.data.title || null),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /api/journal/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update journal entry" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/journal/[id] ──────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Ownership check
    const existing = await getEntryForUser(id);
    if (!existing || existing.internship.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    await prisma.journalEntry.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Journal entry deleted" });
  } catch (error) {
    console.error("[DELETE /api/journal/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
