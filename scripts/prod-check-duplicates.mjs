// Script: prod-check-duplicates.mjs
// Connects to production Neon DB, finds near-duplicate journal entries,
// shows what would be deleted, then (if --delete flag is passed) deletes them.

import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;
const PROD_URL = 'postgresql://neondb_owner:npg_sTwRJ0ImOW4h@ep-jolly-surf-a1sxstig.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const DO_DELETE = process.argv.includes('--delete');

const client = new Client({ connectionString: PROD_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('Connected to production Neon DB.\n');

// --- List all tables to confirm schema ---
const { rows: tables } = await client.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
);
console.log('Tables:', tables.map(x => x.table_name).join(', '));
console.log('');

// --- Check if JournalEntry exists ---
const hasJournal = tables.some(t => t.table_name === 'JournalEntry');
const hasJournalLower = tables.some(t => t.table_name === 'journal_entry');
const journalTable = hasJournal ? '"JournalEntry"' : hasJournalLower ? 'journal_entry' : null;

if (!journalTable) {
  console.log('No JournalEntry table found. No journal duplicates to clean up.');
} else {
  console.log(`Using journal table: ${journalTable}`);
  
  // Fetch all journal entries with internship userId
  const { rows: entries } = await client.query(`
    SELECT j.id, j.title, j.content, j.date, j."createdAt", j.mood, j."internshipId",
           i."userId", i.company
    FROM ${journalTable} j
    JOIN "Internship" i ON j."internshipId" = i.id
    ORDER BY j."createdAt" ASC
  `);

  console.log('=== JOURNAL ENTRIES ===');
  console.log('Total:', entries.length);
  console.log('');
  entries.forEach(e => {
    console.log({
      id: e.id,
      date_UTC: new Date(e.date).toISOString(),
      createdAt_UTC: new Date(e.createdAt).toISOString(),
      title: e.title,
      content_preview: (e.content || '').slice(0, 80),
    });
  });
  console.log('');

  // Find duplicates: same userId + same content, createdAt within 120s
  const toDelete = [];
  const seen = new Set();
  for (let i = 0; i < entries.length; i++) {
    if (seen.has(entries[i].id)) continue;
    for (let j = i + 1; j < entries.length; j++) {
      if (seen.has(entries[j].id)) continue;
      const a = entries[i];
      const b = entries[j];
      if (a.userId !== b.userId) continue;
      const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
      const contentMatch = (a.content || '').trim() === (b.content || '').trim();
      if (contentMatch && timeDiff < 120) {
        // Keep the first (a), delete the duplicate (b)
        toDelete.push(b);
        seen.add(b.id);
        console.log('--- DUPLICATE FOUND ---');
        console.log('KEEP  Entry A:', a.id, '| createdAt:', new Date(a.createdAt).toISOString());
        console.log('DELETE Entry B:', b.id, '| createdAt:', new Date(b.createdAt).toISOString());
        console.log('Time diff (s):', timeDiff.toFixed(1));
        console.log('Title:', a.title);
        console.log('Content preview:', (a.content || '').slice(0, 120));
        console.log('');
      }
    }
  }

  if (toDelete.length === 0) {
    console.log('No duplicate journal entries found. Nothing to delete.');
  } else {
    console.log(`Found ${toDelete.length} duplicate(s) to delete.`);
    console.log('IDs to delete:', toDelete.map(e => e.id));
    console.log('');

    if (DO_DELETE) {
      for (const entry of toDelete) {
        await client.query(`DELETE FROM ${journalTable} WHERE id = $1`, [entry.id]);
        console.log('Deleted:', entry.id);
      }
      console.log('\nCleanup complete.');
    } else {
      console.log('DRY RUN — no rows deleted. Pass --delete to actually delete.');
      console.log('Example: node scripts/prod-check-duplicates.mjs --delete');
    }
  }
}

// --- Also check LogEntry duplicates in prod ---
console.log('\n=== LOG ENTRIES (production) ===');
const { rows: logs } = await client.query(`
  SELECT l.id, l.description, l.hours, l.date, l."createdAt", i."userId"
  FROM "LogEntry" l
  JOIN "Internship" i ON l."internshipId" = i.id
  ORDER BY l."createdAt" ASC
`);
console.log('Total:', logs.length);
logs.forEach(e => {
  console.log({ id: e.id, date_UTC: new Date(e.date).toISOString(), createdAt_UTC: new Date(e.createdAt).toISOString(), hours: e.hours, desc_preview: (e.description||'').slice(0,60) });
});

const logDups = [];
for (let i = 0; i < logs.length; i++) {
  for (let j = i+1; j < logs.length; j++) {
    const a = logs[i], b = logs[j];
    if (a.userId !== b.userId) continue;
    const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
    const match = (a.description||'').trim() === (b.description||'').trim() && parseFloat(a.hours) === parseFloat(b.hours);
    if (match && timeDiff < 120) logDups.push({a, b, timeDiff});
  }
}
if (logDups.length > 0) {
  console.log('\nLog duplicate pairs:');
  logDups.forEach(({a, b, timeDiff}) => {
    console.log('KEEP', a.id, '| DELETE', b.id, '| diff:', timeDiff.toFixed(1)+'s');
  });
}

// Timezone check
const { rows: tz } = await client.query(`SELECT current_setting('TimeZone') as pg_tz, NOW() as pg_now`);
console.log('\n=== Timezone (production DB) ===');
console.log('PG TimeZone:', tz[0].pg_tz);
console.log('PG NOW():', tz[0].pg_now);

await client.end();
