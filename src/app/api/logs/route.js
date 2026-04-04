import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ============================================================
// TEMPORARY: Replace this in Phase 7 with real session userId
// ============================================================
const TEMP_USER_ID = "temp-user-1";

// -------------------------------------------------------
// Zod Schema — validates new log entry input
// -------------------------------------------------------
const createLogSchema = z.object({
  internshipId: z.string().min(1, "Internship ID is required"),
  date: z.string().datetime("Invalid date format"),
  description: z.string().min(1, "Description is required"),
  hours: z.number().positive("Hours must be a positive number"),
});

// -------------------------------------------------------
// GET /api/logs
// Returns all log entries for the current user
// Optionally filter by internshipId via query param
// Example: /api/logs?internshipId=xxx
// -------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get("internshipId");

    // Build the query dynamically
    const where = {
      internship: {
        userId: TEMP_USER_ID, // security: only this user's logs
      },
    };

    // If internshipId is provided, filter by it
    if (internshipId) {
      where.internshipId = internshipId;
    }

    const logs = await prisma.logEntry.findMany({
      where,
      orderBy: { date: "desc" },
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
      data: logs,
    });

  } catch (error) {
    console.error("[GET /api/logs]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// POST /api/logs
// Creates a new log entry under an internship
// -------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();

    // Step 1: Validate input
    const validation = createLogSchema.safeParse(body);
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

    const { internshipId, date, description, hours } = validation.data;

    // Step 2: Verify the internship exists and belongs to this user
    const internship = await prisma.internship.findUnique({
      where: {
        id: internshipId,
        userId: TEMP_USER_ID,
      },
    });

    if (!internship) {
      return NextResponse.json(
        { success: false, error: "Internship not found" },
        { status: 404 }
      );
    }

    // Step 3: Create the log entry
    const log = await prisma.logEntry.create({
      data: {
        internshipId,
        date,
        description,
        hours,
      },
    });

    return NextResponse.json(
      { success: true, data: log },
      { status: 201 }
    );

  } catch (error) {
    console.error("[POST /api/logs]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create log entry" },
      { status: 500 }
    );
  }
}