// Script: check-duplicates.mjs
// Purpose: Find duplicate journal entries and inspect timezone/timestamp data

import { PrismaClient } from '../src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  // --- Find all journal entries ---
  const entries = await prisma.journalEntry.findMany({
    orderBy: { createdAt: 'asc' },
    include: { internship: { select: { userId: true, company: true } } },
  });

  console.log('=== JOURNAL ENTRIES ===');
  console.log('Total journal entries:', entries.length);
  console.log('');

  // --- Find near-duplicates ---
  const duplicates = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      if (a.internship.userId !== b.internship.userId) continue;
      const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
      const contentMatch = a.content.trim() === b.content.trim();
      if (contentMatch && timeDiff < 120) {
        duplicates.push({ a, b, timeDiff });
      }
    }
  }

  console.log('Duplicate pairs (same content, created within 120s):', duplicates.length);
  duplicates.forEach(({ a, b, timeDiff }) => {
    console.log('--- DUPLICATE PAIR ---');
    console.log('Entry A ID:', a.id, '| createdAt (UTC):', a.createdAt.toISOString());
    console.log('Entry B ID:', b.id, '| createdAt (UTC):', b.createdAt.toISOString());
    console.log('Time diff (s):', timeDiff.toFixed(1));
    console.log('Title A:', a.title, '| Title B:', b.title);
    console.log('Content preview:', a.content.slice(0, 100));
    console.log('');
  });

  // --- Print all entries with timestamps ---
  console.log('=== ALL ENTRIES (timestamps) ===');
  entries.forEach(e => {
    console.log({
      id: e.id,
      date_stored: e.date?.toISOString(),
      createdAt_stored: e.createdAt?.toISOString(),
      title: e.title,
      content_preview: e.content?.slice(0, 60),
    });
  });

  // --- Also check log entries ---
  console.log('');
  console.log('=== LOG ENTRIES ===');
  const logs = await prisma.logEntry.findMany({
    orderBy: { createdAt: 'asc' },
    include: { internship: { select: { userId: true, company: true } } },
  });
  console.log('Total log entries:', logs.length);
  logs.forEach(e => {
    console.log({
      id: e.id,
      date_stored: e.date?.toISOString(),
      createdAt_stored: e.createdAt?.toISOString(),
      hours: e.hours,
      description_preview: e.description?.slice(0, 60),
    });
  });

  // --- Find duplicate log entries ---
  const logDuplicates = [];
  for (let i = 0; i < logs.length; i++) {
    for (let j = i + 1; j < logs.length; j++) {
      const a = logs[i];
      const b = logs[j];
      if (a.internship.userId !== b.internship.userId) continue;
      const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
      const contentMatch = a.description.trim() === b.description.trim() && a.hours === b.hours;
      if (contentMatch && timeDiff < 120) {
        logDuplicates.push({ a, b, timeDiff });
      }
    }
  }
  console.log('');
  console.log('Duplicate log pairs (same description+hours, created within 120s):', logDuplicates.length);
  logDuplicates.forEach(({ a, b, timeDiff }) => {
    console.log('--- DUPLICATE LOG PAIR ---');
    console.log('Log A ID:', a.id, '| createdAt (UTC):', a.createdAt.toISOString());
    console.log('Log B ID:', b.id, '| createdAt (UTC):', b.createdAt.toISOString());
    console.log('Time diff (s):', timeDiff.toFixed(1));
    console.log('Description preview:', a.description.slice(0, 100));
    console.log('');
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
