// scripts/test-rate-limit.js
// Purpose: Verify that the /api/auth/sign-in/email endpoint returns HTTP 429
//          after exceeding the customRules limit (max: 10 per 60s window).
//
// Usage:
//   node scripts/test-rate-limit.js
//
// Prerequisites:
//   - Dev server must be running: npm run dev
//   - rateLimit.enabled: true must be set in src/lib/auth.js (it is)
//
// Expected output:
//   Request  1: 200 or 401  (wrong password — correct behaviour)
//   ...
//   Request 10: 200 or 401
//   Request 11: 429         <- rate limit fires here
//   Request 12: 429

const ENDPOINT = "http://localhost:3000/api/auth/sign-in/email";
const TOTAL    = 12;   // 2 more than max:10 so we see the transition clearly

async function main() {
  console.log(`Firing ${TOTAL} rapid POST requests to ${ENDPOINT}`);
  console.log("Expecting 429 on request 11+\n");

  let sawRateLimit = false;

  for (let i = 1; i <= TOTAL; i++) {
    const res = await fetch(ENDPOINT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      // Deliberately wrong password so we never accidentally log in.
      body: JSON.stringify({
        email:    "ratelimittest@example.invalid",
        password: "not-a-real-password",
      }),
    });

    const label = res.status === 429
      ? `HTTP ${res.status} ? rate limit enforced ?`
      : `HTTP ${res.status}`;

    console.log(`  Request ${String(i).padStart(2)}: ${label}`);

    if (res.status === 429) sawRateLimit = true;
  }

  console.log();
  if (sawRateLimit) {
    console.log("PASS: 429 was returned — rate limit is active and enforced.");
    process.exit(0);
  } else {
    console.error("FAIL: No 429 received after exceeding the threshold.");
    console.error("Check that rateLimit.enabled: true is set and the dev server is running.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Script error:", err.message);
  console.error("Is the dev server running? (npm run dev)");
  process.exit(1);
});
