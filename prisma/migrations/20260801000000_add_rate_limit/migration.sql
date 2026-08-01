-- Migration: 20260801000000_add_rate_limit
-- Purpose: Create the rate_limit table required by Better Auth's
--          rateLimit.storage: "database" option.
--
-- Better Auth writes one row per (IP x endpoint) key:
--   key         -- e.g. "127.0.0.1:/sign-in/email"
--   count       -- number of requests in the current window
--   last_request -- Unix timestamp (ms) of the most recent request

CREATE TABLE "rate_limit" (
    "id"           TEXT NOT NULL,
    "key"          TEXT NOT NULL,
    "count"        INTEGER NOT NULL,
    "last_request" BIGINT NOT NULL,
    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("id")
);
