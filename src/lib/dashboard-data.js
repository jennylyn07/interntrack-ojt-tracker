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
// getDashboardOverview(userId, preferredInternshipId?)
// Returns all data needed by the dashboard page.
// preferredInternshipId: when a user has multiple ACTIVE internships and
// has selected one via the switcher, this pins the dashboard to that one.
// -------------------------------------------------------
export async function getDashboardOverview(userId, preferredInternshipId = null) {
  if (!userId) {
    throw new Error("getDashboardOverview: userId is required");
  }
  // Step 1: Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Step 2: Get the active internship for this user.
  // If the user has selected a specific internship via the switcher, honour that
  // choice — but validate it still belongs to them and is ACTIVE.
  // Fall back to most-recently-started ACTIVE internship.
  let internship = null;
  if (preferredInternshipId) {
    internship = await prisma.internship.findFirst({
      where: { id: preferredInternshipId, userId, status: "ACTIVE" },
    });
  }
  if (!internship) {
    internship = await prisma.internship.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { startDate: "desc" },
    });
  }

  // Step 3: If no internship found, return a safe empty state
  if (!internship) {
    return {
      internshipId: null,
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
  return {
    internshipId: internship.id,
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

// -------------------------------------------------------
// getUserInternships(userId, showArchived?)
// Returns internships for a user with computed hours.
// showArchived=false (default): only non-archived.
// showArchived=true: only archived (for the "Show archived" view).
// -------------------------------------------------------
export async function getUserInternships(userId, showArchived = false) {
  if (!userId) {
    throw new Error("getUserInternships: userId is required");
  }

  const internships = await prisma.internship.findMany({
    where: { userId, archived: showArchived },
    orderBy: { startDate: "desc" },
    include: {
      logEntries: { select: { hours: true } },
    },
  });

  return internships.map((internship) => ({
    id: internship.id,
    company: internship.company,
    supervisor: internship.supervisor,
    requiredHours: internship.requiredHours,
    startDate: internship.startDate,
    endDate: internship.endDate,
    status: internship.status,
    archived: internship.archived,
    completedHours: internship.logEntries.reduce((sum, e) => sum + e.hours, 0),
  }));
}

// -------------------------------------------------------
// getActiveInternships(userId)
// Returns only id + company for every ACTIVE internship.
// Used by the InternshipSwitcher to populate the dropdown
// without the overhead of fetching log data for each.
// -------------------------------------------------------
export async function getActiveInternships(userId) {
  if (!userId) return [];
  return await prisma.internship.findMany({
    where: { userId, status: "ACTIVE", archived: false },
    orderBy: { startDate: "desc" },
    select: { id: true, company: true },
  });
}
