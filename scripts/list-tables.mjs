// list-tables.mjs
import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:ayokomagisip@localhost:5432/ojt_tracker',
});
await client.connect();

const { rows } = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
console.log('Tables:', rows.map(x => x.table_name));

// Check journal entries
const { rows: je } = await client.query(`SELECT * FROM "journal_entry" LIMIT 5`).catch(() => 
  client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%journal%'`)
);
console.log('Journal check:', je);

await client.end();
