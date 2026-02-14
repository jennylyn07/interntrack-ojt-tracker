// File: src/lib/dashboard-data.js
// Purpose: Central place for dashboard data fetching.
// This file currently returns mock data so the UI can be developed and
// understood in isolation. Later, you will replace these functions with
// real Prisma queries that load data for the authenticated student.

// NOTE FOR FUTURE YOU:
// - Once NextAuth is configured, dashboard server components can call a
//   function like `getDashboardOverview(userId)` where `userId` comes from
//   the session.
// - Inside that function you will use Prisma models such as User,
//   StudentProfile and OjtLog to compute the same shape of data that the
//   dashboard components expect today.

// Returns a high-level summary object used by the dashboard page.
// Keeping this as a single function means the UI is not tightly coupled
// to the eventual database schema – only this layer needs updating.
export async function getDashboardOverview() {
  // In a real app this would be an async database call.
  // We keep it async already so that swapping in Prisma later
  // does not change the calling code.

  const student = {
    // Mock student identity – this will later come from `User` + `StudentProfile`.
    name: "Jamie Cruz",
    program: "BS Information Technology",
    company: "Acme Software Solutions",
  };

  const requiredHours = 600;
  const completedHours = 180;
  const remainingHours = requiredHours - completedHours;
  const percentage = Math.max(
    0,
    Math.min(100, Math.round((completedHours / requiredHours) * 100))
  );

  const todayLog = {
    // In a real implementation you might filter OjtLog by `date = today`.
    date: new Date().toISOString().slice(0, 10),
    hoursToday: 4,
    summary: "Shadowed senior developer during code review and documented notes.",
    hasLog: true,
  };

  const checklistItems = [
    {
      id: "orientation",
      label: "Attend company orientation session",
      completed: true,
    },
    {
      id: "profile",
      label: "Complete OJT profile (company, start date, required hours)",
      completed: false,
    },
    {
      id: "first-log",
      label: "Submit your first daily log entry",
      completed: true,
    },
    {
      id: "mid-report",
      label: "Prepare mid-term OJT progress report",
      completed: false,
    },
  ];

  const timeline = [
    {
      id: "t1",
      date: "2026-02-10",
      title: "Backend bug fixing and testing",
      hours: 6,
      type: "log",
    },
    {
      id: "t2",
      date: "2026-02-08",
      title: "Sprint planning meeting with mentor",
      hours: 3,
      type: "meeting",
    },
    {
      id: "t3",
      date: "2026-02-05",
      title: "OJT orientation and environment setup",
      hours: 5,
      type: "milestone",
    },
  ];

  return {
    student,
    progress: {
      requiredHours,
      completedHours,
      remainingHours,
      percentage,
    },
    todayLog,
    checklistItems,
    timeline,
  };
}

