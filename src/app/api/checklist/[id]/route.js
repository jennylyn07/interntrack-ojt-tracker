import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================
// TEMPORARY: Replace this in Phase 7 with real session userId
// ============================================================
const TEMP_USER_ID = "temp-user-1";

// -------------------------------------------------------
// Zod Schema — for toggling or updating title
// -------------------------------------------------------
const updateChecklistSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  completed: z.boolean().optional(),
});

// -------------------------------------------------------
// Helper — verify item exists and belongs to this user
// -------------------------------------------------------
async function getItemForUser(id) {
  return await prisma.checklistItem.findUnique({
    where: { id },
    include: {
      internship: {
        select: { userId: true },
      },
    },
  });
}

// -------------------------------------------------------
// GET /api/checklist/[id]
// Returns a single checklist item
// -------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const item = await getItemForUser(id);

    if (!item || item.internship.userId !== TEMP_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Checklist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });

  } catch (error) {
    console.error("[GET /api/checklist/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch checklist item" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// PUT /api/checklist/[id]
// Updates title or toggles completed status
// This is the main route the frontend ChecklistCard uses
// -------------------------------------------------------
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateChecklistSchema.safeParse(body);
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

    // Verify ownership
    const existing = await getItemForUser(id);
    if (!existing || existing.internship.userId !== TEMP_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Checklist item not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.checklistItem.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error("[PUT /api/checklist/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// DELETE /api/checklist/[id]
// Deletes a single checklist item
// -------------------------------------------------------
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existing = await getItemForUser(id);
    if (!existing || existing.internship.userId !== TEMP_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Checklist item not found" },
        { status: 404 }
      );
    }

    await prisma.checklistItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Checklist item deleted successfully",
    });

  } catch (error) {
    console.error("[DELETE /api/checklist/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}