import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// -------------------------------------------------------
// Zod Schema — only validate fields that are being updated
// All fields optional since user may update only one field
// -------------------------------------------------------
const updateInternshipSchema = z.object({
  company: z.string().min(1, "Company name is required").optional(),
  supervisor: z.string().min(1, "Supervisor name is required").optional(),
  requiredHours: z.number().int().positive("Must be a positive number").optional(),
  startDate: z.string().datetime("Invalid date format").optional(),
  endDate: z.string().datetime("Invalid date format").optional().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  archived: z.boolean().optional(),
});

// -------------------------------------------------------
// GET /api/internships/[id]
// Returns a single internship by id
// -------------------------------------------------------
export async function GET(request, { params }) {
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

    const { id } = await params;

    const internship = await prisma.internship.findUnique({
      where: {
        id,
        userId: session.user.id, // security: ensure it belongs to this user
      },
      include: {
        logEntries: {
          orderBy: { date: "desc" },
        },
        checklist: true,
      },
    });

    if (!internship) {
      return NextResponse.json(
        { success: false, error: "Internship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: internship,
    });

  } catch (error) {
    console.error("[GET /api/internships/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch internship" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// PUT /api/internships/[id]
// Updates an existing internship
// -------------------------------------------------------
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();

    // Step 1: Validate input
    const validation = updateInternshipSchema.safeParse(body);
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
    const existing = await prisma.internship.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Internship not found" },
        { status: 404 }
      );
    }

    // Step 3: Update
    const updated = await prisma.internship.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error("[PUT /api/internships/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update internship" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// DELETE /api/internships/[id]
// Deletes an internship and all related logs + checklist
// -------------------------------------------------------
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Step 1: Check it exists and belongs to this user
    const existing = await prisma.internship.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Internship not found" },
        { status: 404 }
      );
    }

    // Step 2: Delete related records first (logs + checklist)
    // then delete the internship itself
    await prisma.$transaction([
      prisma.logEntry.deleteMany({ where: { internshipId: id } }),
      prisma.checklistItem.deleteMany({ where: { internshipId: id } }),
      prisma.internship.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Internship deleted successfully",
    });

  } catch (error) {
    console.error("[DELETE /api/internships/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete internship" },
      { status: 500 }
    );
  }
}