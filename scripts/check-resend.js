// Diagnostic: verify RESEND_API_KEY is valid by hitting Resend's /emails endpoint.
// We send nothing real — just hit the validation layer with an intentionally
// malformed request. A 401 → key is invalid/missing. A 422 → key is valid (format
// error from the payload, not auth). A 200 → actually sent (won't happen with this body).
require('dotenv').config({ path: '.env' });

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error('❌  RESEND_API_KEY is not set in .env');
  process.exit(1);
}
console.log(`\nTesting RESEND_API_KEY: ${key.slice(0, 8)}...${key.slice(-4)}`);

async function checkKey() {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    // Deliberately empty body — will produce a 422 if auth passes, 401 if not.
    body: JSON.stringify({}),
  });

  const body = await res.json().catch(() => ({}));
  console.log(`\nHTTP status: ${res.status}`);
  console.log('Response:', JSON.stringify(body, null, 2));

  if (res.status === 401) {
    console.error('\n❌  Key is INVALID or revoked — Resend rejected the auth token.');
  } else if (res.status === 422) {
    console.log('\n✅  Key is VALID — Resend accepted authentication (422 is a payload error, not auth).');
  } else if (res.status === 200) {
    console.log('\n✅  Key is valid and email was accepted.');
  } else {
    console.log(`\n⚠️  Unexpected status ${res.status} — check response above.`);
  }
}

checkKey().catch(e => { console.error('Fetch failed:', e.message); process.exit(1); });
