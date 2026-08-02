import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// -------------------------------------------------------
// Zod Schema
// -------------------------------------------------------
const createChecklistSchema = z.object({
  internshipId: z.string().min(1, "Internship ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
});

// -------------------------------------------------------
// GET /api/checklist
// Returns all checklist items for the current user
// Optionally filter by internshipId via query param
// Example: /api/checklist?internshipId=xxx
// -------------------------------------------------------
export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get("internshipId");

    const where = {
      internship: {
        userId: session.user.id,
      },
    };

    if (internshipId) {
      where.internshipId = internshipId;
    }

    const items = await prisma.checklistItem.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        internship: {
          select: {
            company: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });

  } catch (error) {
    console.error("[GET /api/checklist]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch checklist items" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// POST /api/checklist
// Creates a new checklist item under an internship
// -------------------------------------------------------
export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = createChecklistSchema.safeParse(body);
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

    const { internshipId, title } = validation.data;

    // Verify internship exists and belongs to this user
    const internship = await prisma.internship.findFirst({
      where: {
        id: internshipId,
        userId: session.user.id,
      },
    });

    if (!internship) {
      return NextResponse.json(
        { success: false, error: "Internship not found" },
        { status: 404 }
      );
    }

    const item = await prisma.checklistItem.create({
      data: {
        internshipId,
        title,
        completed: false,
      },
    });

    return NextResponse.json(
      { success: true, data: item },
      { status: 201 }
    );

  } catch (error) {
    console.error("[POST /api/checklist]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}