import "dotenv/config";
import { defineConfig } from "prisma/config";

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
    url: process.env["DIRECT_URL"],
  },
});