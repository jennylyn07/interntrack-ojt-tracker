// File: src/lib/dashboard-data.js
// Purpose: Central place for dashboard data fetching.
// Phase 6: Now uses real Prisma queries instead of mock data.
// Phase 7: Requires real session userId from Better Auth.

import { prisma } from "@/lib/prisma";

// -------------------------------------------------------
// Helper: Get today's date range (start and end of today)
// -------------------------------------------------------
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// -------------------------------------------------------
// getDashboardOverview(userId)
// Returns all data needed by the dashboard page.
// -------------------------------------------------------
export async function getDashboardOverview(userId) {
  if (!userId) {
    throw new Error("getDashboardOverview: userId is required");
  }
  // Step 1: Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Step 2: Get the active internship for this user
  const internship = await prisma.internship.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { startDate: "desc" },
  });

  // Step 3: If no internship found, return a safe empty state
  if (!internship) {
    return {
      student: {
        name: user?.name ?? user?.email ?? "Student",
        program: "",
        company: null,
      },
      progress: {
        requiredHours: 0,
        completedHours: 0,
        remainingHours: 0,
        percentage: 0,
      },
      todayLog: {
        date: new Date().toISOString().slice(0, 10),
        hoursToday: 0,
        summary: null,
        hasLog: false,
      },
      checklistItems: [],
      timeline: [],
    };
  }

  // Step 4: Calculate completed hours from all log entries
  const logEntries = await prisma.logEntry.findMany({
    where: { internshipId: internship.id },
    orderBy: { date: "desc" },
  });

  const completedHours = logEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );
  const requiredHours = internship.requiredHours;
  const remainingHours = Math.max(0, requiredHours - completedHours);
  const percentage = requiredHours > 0
    ? Math.max(0, Math.min(100, Math.round((completedHours / requiredHours) * 100)))
    : 0;

  // Step 5: Get today's log entry if it exists
  const { start, end } = getTodayRange();
  const todayEntries = logEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });

  const hoursToday = todayEntries.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );
  const todayLog = {
    date: new Date().toISOString().slice(0, 10),
    hoursToday,
    summary: todayEntries[0]?.description ?? null,
    hasLog: todayEntries.length > 0,
  };

  // Step 6: Get checklist items for this internship
  const checklistItems = await prisma.checklistItem.findMany({
    where: { internshipId: internship.id },
    orderBy: { id: "asc" },
  });

  // Step 7: Build timeline from last 3 log entries
  const timeline = logEntries.slice(0, 3).map(entry => ({
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    title: entry.description,
    hours: entry.hours,
    type: "log",
  }));

  // Step 8: Return the full dashboard data
  // Shape is identical to mock version — no component changes needed
  return {
    student: {
      name: user?.name ?? user?.email ?? "Student",
      program: "",
      company: internship.company,
    },
    progress: {
      requiredHours,
      completedHours,
      remainingHours,
      percentage,
    },
    todayLog,
    checklistItems: checklistItems.map(item => ({
      id: item.id,
      label: item.title,
      completed: item.completed,
    })),
    timeline,
  };
}