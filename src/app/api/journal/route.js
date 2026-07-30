// File: src/app/api/journal/route.js
// Purpose: Journal entry list and creation endpoints.
//
// GET  /api/journal?internshipId=xxx — all entries for the authed user,
//      newest-first. Optionally scoped to one internship via query param.
// POST /api/journal — create a new journal entry.
//
// Security: every query filters through internship.userId = session.user.id
// so users can only ever see / create entries for their own internships.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ── Zod schema ────────────────────────────────────────────────────────────────
const VALID_MOODS = ["GREAT", "GOOD", "OKAY", "ROUGH", "TERRIBLE"];

const createJournalSchema = z.object({
  internshipId: z.string().min(1, "Internship ID is required"),
  date: z.string().datetime("Invalid date format"),
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1, "Journal content is required"),
  mood: z.enum(["GREAT", "GOOD", "OKAY", "ROUGH", "TERRIBLE"]).default("OKAY"),
});

// ── GET /api/journal ──────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get("internshipId");

    // Always scope to the authenticated user via the internship relation
    const where = {
      internship: { userId: session.user.id },
    };
    if (internshipId) {
      where.internshipId = internshipId;
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        internship: { select: { company: true, status: true } },
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("[GET /api/journal]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

// ── POST /api/journal ─────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createJournalSchema.safeParse(body);
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

    const { internshipId, date, title, content, mood } = validation.data;

    // Verify the internship belongs to this user (IDOR protection)
    const internship = await prisma.internship.findFirst({
      where: { id: internshipId, userId: session.user.id },
    });
    if (!internship) {
      return NextResponse.json(
        { success: false, error: "Internship not found" },
        { status: 404 }
      );
    }

    const entry = await prisma.journalEntry.create({
      data: { internshipId, date, title: title || null, content, mood },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/journal]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create journal entry" },
      { status: 500 }
    );
  }
}
