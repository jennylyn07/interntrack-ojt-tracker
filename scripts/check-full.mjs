// check-full.mjs
import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:ayokomagisip@localhost:5432/ojt_tracker',
});
await client.connect();

const { rows: tables } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log('ALL Tables:', tables.map(x => x.table_name));
console.log('');

// Check LogEntry
const { rows: logs } = await client.query(`SELECT id, description, hours, date, "createdAt" FROM "LogEntry" ORDER BY "createdAt" ASC`);
console.log('=== LogEntry ===');
console.log('Total:', logs.length);
logs.forEach(e => {
  console.log({ id: e.id, date_UTC: new Date(e.date).toISOString(), createdAt_UTC: new Date(e.createdAt).toISOString(), hours: e.hours, desc_preview: (e.description||'').slice(0,60) });
});

// Find log duplicates
const logDups = [];
for (let i = 0; i < logs.length; i++) {
  for (let j = i+1; j < logs.length; j++) {
    const a = logs[i], b = logs[j];
    const timeDiff = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / 1000;
    const match = (a.description||'').trim() === (b.description||'').trim() && parseFloat(a.hours) === parseFloat(b.hours);
    if (match && timeDiff < 120) logDups.push({a, b, timeDiff});
  }
}
console.log('Log duplicate pairs:', logDups.length);
logDups.forEach(({a, b, timeDiff}) => {
  console.log('DUP LOG:', a.id, 'vs', b.id, '| diff:', timeDiff.toFixed(1)+'s');
  console.log('  A createdAt:', new Date(a.createdAt).toISOString());
  console.log('  B createdAt:', new Date(b.createdAt).toISOString());
  console.log('  desc:', (a.description||'').slice(0,80));
});

// Check ChecklistItem
const { rows: cl } = await client.query(`SELECT id, title, completed, "internshipId" FROM "ChecklistItem" ORDER BY id ASC`);
console.log('');
console.log('=== ChecklistItem ===');
console.log('Total:', cl.length);
cl.forEach(e => { console.log({ id: e.id, title: e.title, completed: e.completed }); });

// Timezone
const { rows: tz } = await client.query(`SELECT NOW() as now_pg, current_setting('TimeZone') as pg_tz, NOW() AT TIME ZONE 'UTC' as now_utc`);
console.log('');
console.log('=== Timezone ===');
console.log('PG timezone setting:', tz[0].pg_tz);
console.log('PG NOW():', tz[0].now_pg);
console.log('PG NOW() AT TIME ZONE UTC:', tz[0].now_utc);
console.log('Node local time:', new Date().toString());
console.log('Node UTC ISO:', new Date().toISOString());

// Also confirm the journal_entry table situation
const { rows: journalRows } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE '%journal%'`);
console.log('');
console.log('Journal-related tables:', journalRows.map(x => x.table_name));

// Check if there is a JournalEntry model but different casing
const { rows: allTablesRaw } = await client.query(`SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public'`);
console.log('pg_tables:', allTablesRaw.map(x => x.tablename));

await client.end();
