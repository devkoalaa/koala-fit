// No "server-only" guard here: this file is imported directly by the CLI
// seed scripts (tsx, outside Next's bundler), where that package throws
// unconditionally. Within the app itself, every real consumer is already a
// "use server" action, a Server Component, or a "server-only"-guarded lib
// module (session.ts, streak.ts, ...) — no client component ever imports
// `db` directly.
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
