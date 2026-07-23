import { config as dotenv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load environment variables the same way Next.js does:
// .env is the base file (can be committed); .env.local overrides it (gitignored, real secrets).
// dotenv/config by default only reads .env, so we explicitly load both.
dotenv({ path: ".env" });
dotenv({ path: ".env.local", override: true });

// IMPORTANT: datasource.url must be the DIRECT (non-pooled) connection string.
// Neon provides two URLs:
//   DATABASE_URL — pooled (via PgBouncer), used by the running app at runtime.
//   DIRECT_URL   — direct TCP connection, required by prisma migrate for schema ops.
// Using DATABASE_URL here causes migrate deploy to fail against Neon.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});