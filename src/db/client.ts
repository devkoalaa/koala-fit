// No "server-only" guard here: this file is imported directly by the CLI
// seed scripts (tsx, outside Next's bundler), where that package throws
// unconditionally. Within the app itself, every real consumer is already a
// "use server" action, a Server Component, or a "server-only"-guarded lib
// module (session.ts, streak.ts, ...) — no client component ever imports
// `db` directly.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
