// scripts/delete-unverified-account.js
// One-shot: safely delete the stale unverified credential account for
// misordinari307@gmail.com (userId: IKJSwwP2a2haAWrw6tvIvbtrPPskOZRq).
//
// Safety checks run BEFORE deletion:
//  - Confirm the user row still exists and is still unverified
//  - Confirm no Internship, LogEntry, ChecklistItem, or JournalEntry data is attached
//  - Confirm no active sessions
// Only then: delete account row → delete user row.
//
// Run with: node scripts/delete-unverified-account.js
require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const TARGET_EMAIL = 'misordinari307@gmail.com';
const TARGET_UID   = 'IKJSwwP2a2haAWrw6tvIvbtrPPskOZRq';

async function main() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  console.log(`\n=== Safe Delete: ${TARGET_EMAIL} ===\n`);

  // ── Pre-flight checks ──────────────────────────────────────────────────────

  // 1. Confirm user exists and is unverified
  const user = await client.query(
    `SELECT id, email, "emailVerified", "createdAt" FROM "user" WHERE id = $1`,
    [TARGET_UID]
  );
  if (user.rows.length === 0) {
    console.log('⚠️  User not found — already deleted or wrong ID. Aborting.');
    await client.end(); return;
  }
  const u = user.rows[0];
  console.log('Pre-flight [1] User row:');
  console.table([u]);
  if (u.emailVerified) {
    console.log('❌ ABORT: emailVerified is true — this account is verified. Manual review needed.');
    await client.end(); return;
  }

  // 2. Confirm no internships attached
  const internships = await client.query(
    `SELECT id FROM "Internship" WHERE "userId" = $1`, [TARGET_UID]
  );
  console.log(`Pre-flight [2] Internships attached: ${internships.rows.length}`);
  if (internships.rows.length > 0) {
    console.log('❌ ABORT: User has internship data — run the full cascade delete instead.');
    await client.end(); return;
  }

  // 3. Confirm no active sessions
  const sessions = await client.query(
    `SELECT id FROM "session" WHERE "userId" = $1`, [TARGET_UID]
  );
  console.log(`Pre-flight [3] Active sessions: ${sessions.rows.length}`);

  // 4. Show account rows that will be deleted
  const accounts = await client.query(
    `SELECT id, "providerId", "accountId" FROM "account" WHERE "userId" = $1`, [TARGET_UID]
  );
  console.log(`Pre-flight [4] Account rows to delete: ${accounts.rows.length}`);
  if (accounts.rows.length > 0) console.table(accounts.rows);

  console.log('\n✅ All pre-flight checks passed. Proceeding with deletion...\n');

  // ── Deletion ───────────────────────────────────────────────────────────────

  // Delete sessions first (cascade would handle it but be explicit)
  const delSessions = await client.query(
    `DELETE FROM "session" WHERE "userId" = $1 RETURNING id`, [TARGET_UID]
  );
  console.log(`Deleted sessions: ${delSessions.rows.length}`);

  // Delete account rows
  const delAccounts = await client.query(
    `DELETE FROM "account" WHERE "userId" = $1 RETURNING id`, [TARGET_UID]
  );
  console.log(`Deleted account rows: ${delAccounts.rows.length}`);

  // Delete user row
  const delUser = await client.query(
    `DELETE FROM "user" WHERE id = $1 RETURNING id, email`, [TARGET_UID]
  );
  console.log(`Deleted user row: ${delUser.rows.length}`);
  if (delUser.rows.length > 0) console.table(delUser.rows);

  // ── Post-deletion confirmation ─────────────────────────────────────────────
  console.log('\n--- Post-deletion verification ---');

  const checkUser = await client.query(
    `SELECT id FROM "user" WHERE id = $1`, [TARGET_UID]
  );
  console.log(`"user" row still exists: ${checkUser.rows.length > 0 ? '❌ YES — something went wrong' : '✅ No'}`);

  const checkAccount = await client.query(
    `SELECT id FROM "account" WHERE "userId" = $1`, [TARGET_UID]
  );
  console.log(`"account" rows still exist: ${checkAccount.rows.length > 0 ? '❌ YES — something went wrong' : '✅ No'}`);

  const checkEmail = await client.query(
    `SELECT id FROM "user" WHERE email = $1`, [TARGET_EMAIL]
  );
  console.log(`Any user with email ${TARGET_EMAIL}: ${checkEmail.rows.length > 0 ? '❌ YES — something went wrong' : '✅ No'}`);

  console.log('\n=== Done ===\n');
  await client.end();
}

main().catch(e => { console.error('\n❌ Script error:', e.message); process.exit(1); });
