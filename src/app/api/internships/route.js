import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// -------------------------------------------------------
// Zod Schema — defines what valid input looks like
// If the request body doesn't match this, we reject it
// -------------------------------------------------------
const createInternshipSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  supervisor: z.string().min(1, "Supervisor name is required"),
  requiredHours: z.number().int().positive("Required hours must be a positive number"),
  startDate: z.string().datetime("Invalid date format"),
  endDate: z.string().datetime("Invalid date format").optional(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]).default("PENDING"),
});

// -------------------------------------------------------
// GET /api/internships
// Returns all internships belonging to the current user
// -------------------------------------------------------
export async function GET() {
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

    const internships = await prisma.internship.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: internships,
    });

  } catch (error) {
    console.error("[GET /api/internships]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch internships" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// POST /api/internships
// Creates a new internship for the current user
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

    // Step 1: Read the request body
    const body = await request.json();

    // Step 2: Validate with Zod
    const validation = createInternshipSchema.safeParse(body);
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

    // Step 3: Create in DB
    const internship = await prisma.internship.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
    });

    // Step 4: Return the created record
    return NextResponse.json(
      { success: true, data: internship },
      { status: 201 }
    );

  } catch (error) {
    console.error("[POST /api/internships]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create internship" },
      { status: 500 }
    );
  }
}