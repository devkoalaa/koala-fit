import { defineConfig } from "drizzle-kit";

// `generate` only diffs the schema against local migration snapshots and doesn't
// need a real connection. `migrate`/`studio`/`push` do — they'll fail with a clear
// connection error until DATABASE_URL is set (see .env.example).
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://placeholder",
  },
  strict: true,
  verbose: true,
});
