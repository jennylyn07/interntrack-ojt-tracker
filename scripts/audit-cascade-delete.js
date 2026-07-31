// scripts/audit-cascade-delete.js
// One-shot diagnostic: confirm cascade deletion worked and audit misordinari307@gmail.com.
// Run with: node scripts/audit-cascade-delete.js
require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const TARGET_EMAIL = 'misordinari307@gmail.com';

async function main() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  console.log('\n=== InternTrack — Cascade Delete & Account Audit ===\n');

  // ── 1. All current users ───────────────────────────────────────────────────
  const users = await client.query(
    `SELECT id, email, name, "emailVerified", "createdAt"
     FROM "user"
     ORDER BY "createdAt" DESC`
  );
  console.log(`[1] All users in "user" table (${users.rows.length} total):`);
  console.table(users.rows.map(r => ({
    id: r.id,
    email: r.email,
    name: r.name,
    emailVerified: r.emailVerified,
    createdAt: r.createdAt,
  })));

  const currentUserIds = users.rows.map(r => r.id);

  // ── 2. Orphaned Internships ────────────────────────────────────────────────
  // Internship rows whose userId does NOT match any current user
  const orphanedInternships = await client.query(
    `SELECT i.id, i."userId", i.company, i.status
     FROM "Internship" i
     LEFT JOIN "user" u ON u.id = i."userId"
     WHERE u.id IS NULL`
  );
  console.log(`\n[2] Orphaned Internship rows (userId not in "user" table): ${orphanedInternships.rows.length}`);
  if (orphanedInternships.rows.length > 0) {
    console.table(orphanedInternships.rows);
  } else {
    console.log('    ✅ None — all Internship rows reference a valid user.');
  }

  // ── 3. Orphaned LogEntries ─────────────────────────────────────────────────
  // LogEntry → Internship → User; find any LogEntry whose internship's userId is gone
  const orphanedLogs = await client.query(
    `SELECT le.id, le."internshipId", le.date, le.hours
     FROM "LogEntry" le
     JOIN "Internship" i ON i.id = le."internshipId"
     LEFT JOIN "user" u ON u.id = i."userId"
     WHERE u.id IS NULL`
  );
  console.log(`\n[3] Orphaned LogEntry rows (linked to a deleted user's internship): ${orphanedLogs.rows.length}`);
  if (orphanedLogs.rows.length > 0) {
    console.table(orphanedLogs.rows);
  } else {
    console.log('    ✅ None — all LogEntry rows are clean.');
  }

  // ── 4. Orphaned ChecklistItems ─────────────────────────────────────────────
  const orphanedChecklist = await client.query(
    `SELECT ci.id, ci."internshipId", ci.title, ci.completed
     FROM "ChecklistItem" ci
     JOIN "Internship" i ON i.id = ci."internshipId"
     LEFT JOIN "user" u ON u.id = i."userId"
     WHERE u.id IS NULL`
  );
  console.log(`\n[4] Orphaned ChecklistItem rows: ${orphanedChecklist.rows.length}`);
  if (orphanedChecklist.rows.length > 0) {
    console.table(orphanedChecklist.rows);
  } else {
    console.log('    ✅ None — all ChecklistItem rows are clean.');
  }

  // ── 5. Orphaned JournalEntries ─────────────────────────────────────────────
  const orphanedJournal = await client.query(
    `SELECT je.id, je."internshipId", je.date, je.mood
     FROM "JournalEntry" je
     JOIN "Internship" i ON i.id = je."internshipId"
     LEFT JOIN "user" u ON u.id = i."userId"
     WHERE u.id IS NULL`
  );
  console.log(`\n[5] Orphaned JournalEntry rows: ${orphanedJournal.rows.length}`);
  if (orphanedJournal.rows.length > 0) {
    console.table(orphanedJournal.rows);
  } else {
    console.log('    ✅ None — all JournalEntry rows are clean.');
  }

  // ── 6. misordinari307@gmail.com — full audit ──────────────────────────────
  console.log(`\n[6] Audit: ${TARGET_EMAIL}`);

  const userRow = await client.query(
    `SELECT id, email, name, "emailVerified", "createdAt"
     FROM "user" WHERE email = $1`,
    [TARGET_EMAIL]
  );
  if (userRow.rows.length === 0) {
    console.log(`    "user" table: ❌ No row found for ${TARGET_EMAIL}`);
  } else {
    console.log(`    "user" table: ✅ Found ${userRow.rows.length} row(s):`);
    console.table(userRow.rows);
  }

  // Check account table (Better Auth stores provider links here)
  if (userRow.rows.length > 0) {
    const uid = userRow.rows[0].id;
    const accountRows = await client.query(
      `SELECT id, "accountId", "providerId", "userId", "createdAt"
       FROM "account" WHERE "userId" = $1`,
      [uid]
    );
    console.log(`\n    "account" table for userId=${uid}: ${accountRows.rows.length} row(s)`);
    if (accountRows.rows.length > 0) console.table(accountRows.rows);

    const sessionRows = await client.query(
      `SELECT id, "userId", "expiresAt", "createdAt"
       FROM "session" WHERE "userId" = $1`,
      [uid]
    );
    console.log(`\n    "session" table for userId=${uid}: ${sessionRows.rows.length} row(s)`);
    if (sessionRows.rows.length > 0) console.table(sessionRows.rows);
  } else {
    // Even if no user row, check account table by accountId (email)
    const accountByEmail = await client.query(
      `SELECT id, "accountId", "providerId", "userId", "createdAt"
       FROM "account" WHERE "accountId" = $1`,
      [TARGET_EMAIL]
    );
    console.log(`\n    "account" table by accountId=${TARGET_EMAIL}: ${accountByEmail.rows.length} row(s)`);
    if (accountByEmail.rows.length > 0) console.table(accountByEmail.rows);
  }

  // ── 7. error=account_not_linked investigation ──────────────────────────────
  // "account_not_linked" in Better Auth means: a user row with this email
  // exists but has NO account row with providerId='google'. Check both sides.
  console.log('\n[7] account_not_linked diagnosis:');
  const credentialAccount = await client.query(
    `SELECT a."providerId", a."accountId", a."userId"
     FROM "account" a
     JOIN "user" u ON u.id = a."userId"
     WHERE u.email = $1`,
    [TARGET_EMAIL]
  );
  if (credentialAccount.rows.length > 0) {
    console.log(`    Account rows linked to this email's user:`);
    console.table(credentialAccount.rows);
    const hasGoogle = credentialAccount.rows.some(r => r.providerId === 'google');
    const hasCredential = credentialAccount.rows.some(r => r.providerId === 'credential');
    console.log(`    → Has Google provider: ${hasGoogle ? '✅ Yes' : '❌ No'}`);
    console.log(`    → Has credential (email/password) provider: ${hasCredential ? '✅ Yes' : '❌ No'}`);
    if (!hasGoogle && hasCredential) {
      console.log('\n    ⚠️  DIAGNOSIS: This is an email/password account with NO Google link.');
      console.log('       Better Auth throws account_not_linked when you try to OAuth-login');
      console.log('       into an existing email/password account without an explicit link step.');
      console.log('       This is NOT evidence of a failed delete — it is a separate account.');
    }
  } else {
    console.log('    No account rows found for this email — cannot determine account_not_linked cause from DB alone.');
  }

  await client.end();
  console.log('\n=== Audit complete ===\n');
}

main().catch(e => { console.error('\n❌ Script error:', e.message); process.exit(1); });
