import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================
// TEMPORARY: Replace this in Phase 7 with real session userId
// ============================================================
const TEMP_USER_ID = "temp-user-1";

// -------------------------------------------------------
// Zod Schema — all fields optional for partial updates
// -------------------------------------------------------
const updateLogSchema = z.object({
  date: z.string().datetime("Invalid date format").optional(),
  description: z.string().min(1, "Description is required").optional(),
  hours: z.number().positive("Hours must be a positive number").optional(),
});

// -------------------------------------------------------
// GET /api/logs/[id]
// Returns a single log entry
// -------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const log = await prisma.logEntry.findUnique({
      where: { id },
      include: {
        internship: {
          select: {
            userId: true,
            company: true,
            status: true,
          },
        },
      },
    });

    // Check it exists and belongs to this user
    if (!log || log.internship.userId !== TEMP_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Log entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: log,
    });

  } catch (error) {
    console.error("[GET /api/logs/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch log entry" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// PUT /api/logs/[id]
// Updates a single log entry
// -------------------------------------------------------
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Step 1: Validate input
    const validation = updateLogSchema.safeParse(body);
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

    // Step 2: Check it exists and belongs to this user
    const existing = await prisma.logEntry.findUnique({
      where: { id },
      include: {
        internship: {
          select: { userId: true },
        },
      },
    });

    if (!existing || existing.internship.userId !== TEMP_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Log entry not found" },
        { status: 404 }
      );
    }

    // Step 3: Update
    const updated = await prisma.logEntry.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error("[PUT /api/logs/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update log entry" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// DELETE /api/logs/[id]
// Deletes a single log entry
// -------------------------------------------------------
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Step 1: Check it exists and belongs to this user
    const existing = await prisma.logEntry.findUnique({
      where: { id },
      include: {
        internship: {
          select: { userId: true },
        },
      },
    });

    if (!existing || existing.internship.userId !== TEMP_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Log entry not found" },
        { status: 404 }
      );
    }

    // Step 2: Delete
    await prisma.logEntry.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Log entry deleted successfully",
    });

  } catch (error) {
    console.error("[DELETE /api/logs/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete log entry" },
      { status: 500 }
    );
  }
}