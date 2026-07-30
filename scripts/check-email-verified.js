// One-shot script: check emailVerified status of recent users in production DB.
// Run with: node scripts/check-email-verified.js
require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  const usersResult = await client.query(
    `SELECT id, email, name, "emailVerified", "createdAt"
     FROM "user"
     ORDER BY "createdAt" DESC
     LIMIT 10`
  );
  console.log('\n=== Recent users (newest first) ===');
  console.table(usersResult.rows.map(r => ({
    email: r.email,
    name: r.name,
    emailVerified: r.emailVerified,
    createdAt: r.createdAt,
  })));

  // Also check verification tokens outstanding
  const verifResult = await client.query(
    `SELECT identifier, "expiresAt", "createdAt"
     FROM "verification"
     ORDER BY "createdAt" DESC
     LIMIT 10`
  );
  console.log('\n=== Pending verification tokens (newest first) ===');
  if (verifResult.rows.length === 0) {
    console.log('  (none — table is empty)');
  } else {
    console.table(verifResult.rows.map(r => ({
      identifier: r.identifier,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
    })));
  }

  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
