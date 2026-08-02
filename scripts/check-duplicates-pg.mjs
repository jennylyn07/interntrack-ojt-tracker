// Script: check-duplicates-pg.mjs
// Uses pg directly to query the local PostgreSQL database

import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:ayokomagisip@localhost:5432/ojt_tracker?schema=public',
});

await client.connect();

// --- Journal Entries ---
const { rows: journalEntries } = await client.query(`
  SELECT j.id, j.title, j.content, j.date, j."createdAt", j.mood, i."userId", i.company
  FROM "JournalEntry" j
  JOIN "Internship" i ON j."internshipId" = i.id
  ORDER BY j."createdAt" ASC
`);

console.log('=== JOURNAL ENTRIES ===');
console.log('Total:', journalEntries.length);
console.log('');

if (journalEntries.length === 0) {
  console.log('No journal entries found.\n');
} else {
  journalEntries.forEach(e => {
    console.log({
      id: e.id,
      date_stored_UTC: new Date(e.date).toISOString(),
      createdAt_UTC: new Date(e.createdAt).toISOString(),
      title: e.title,
      content_preview: (e.content || '').slice(0, 60),
    });
  });
}

// Find duplicate journal entries
console.log('');
const journalDuplicates = [];
for (let i = 0; i < journalEntries.length; i++) {
  for (let j = i + 1; j < journalEntries.length; j++) {
    const a = journalEntries[i];
    const b = journalEntries[j];
    if (a.userId !== b.userId) continue;
    const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
    const contentMatch = (a.content || '').trim() === (b.content || '').trim();
    if (contentMatch && timeDiff < 120) {
      journalDuplicates.push({ a, b, timeDiff });
    }
  }
}

console.log('Journal duplicate pairs (same content, within 120s):', journalDuplicates.length);
journalDuplicates.forEach(({ a, b, timeDiff }) => {
  console.log('--- JOURNAL DUPLICATE PAIR ---');
  console.log('Entry A:', a.id, '| createdAt UTC:', new Date(a.createdAt).toISOString());
  console.log('Entry B:', b.id, '| createdAt UTC:', new Date(b.createdAt).toISOString());
  console.log('Time diff (s):', timeDiff.toFixed(1));
  console.log('Title A:', a.title, '| Title B:', b.title);
  console.log('Content preview:', (a.content || '').slice(0, 100));
  console.log('SUGGESTED: Delete Entry B (newer):', b.id);
  console.log('');
});

// --- Log Entries ---
const { rows: logEntries } = await client.query(`
  SELECT l.id, l.description, l.hours, l.date, l."createdAt", i."userId", i.company
  FROM "LogEntry" l
  JOIN "Internship" i ON l."internshipId" = i.id
  ORDER BY l."createdAt" ASC
`);

console.log('=== LOG ENTRIES ===');
console.log('Total:', logEntries.length);
console.log('');

if (logEntries.length === 0) {
  console.log('No log entries found.\n');
} else {
  logEntries.forEach(e => {
    console.log({
      id: e.id,
      date_stored_UTC: new Date(e.date).toISOString(),
      createdAt_UTC: new Date(e.createdAt).toISOString(),
      hours: e.hours,
      description_preview: (e.description || '').slice(0, 60),
    });
  });
}

const logDuplicates = [];
for (let i = 0; i < logEntries.length; i++) {
  for (let j = i + 1; j < logEntries.length; j++) {
    const a = logEntries[i];
    const b = logEntries[j];
    if (a.userId !== b.userId) continue;
    const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
    const contentMatch = (a.description || '').trim() === (b.description || '').trim() && parseFloat(a.hours) === parseFloat(b.hours);
    if (contentMatch && timeDiff < 120) {
      logDuplicates.push({ a, b, timeDiff });
    }
  }
}

console.log('');
console.log('Log duplicate pairs (same description+hours, within 120s):', logDuplicates.length);
logDuplicates.forEach(({ a, b, timeDiff }) => {
  console.log('--- LOG DUPLICATE PAIR ---');
  console.log('Log A:', a.id, '| createdAt UTC:', new Date(a.createdAt).toISOString());
  console.log('Log B:', b.id, '| createdAt UTC:', new Date(b.createdAt).toISOString());
  console.log('Time diff (s):', timeDiff.toFixed(1));
  console.log('Description preview:', (a.description || '').slice(0, 100));
  console.log('SUGGESTED: Delete Log B (newer):', b.id);
  console.log('');
});

console.log('');
console.log('=== TIMEZONE INVESTIGATION ===');
// Check what timezone PostgreSQL reports as its local time vs UTC
const { rows: tzRows } = await client.query(`SELECT NOW() as now_pg, NOW() AT TIME ZONE 'UTC' as now_utc, current_setting('TimeZone') as pg_timezone`);
console.log('PostgreSQL timezone setting:', tzRows[0].pg_timezone);
console.log('PostgreSQL NOW():', tzRows[0].now_pg);
console.log('PostgreSQL NOW() AT TIME ZONE UTC:', tzRows[0].now_utc);
console.log('Node.js local time:', new Date().toString());
console.log('Node.js UTC ISO:', new Date().toISOString());

await client.end();
