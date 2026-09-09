// No "server-only" guard here: this module is also imported directly by the
// CLI seed scripts (tsx, outside Next's bundler), where that package throws
// unconditionally. Every Next.js-side consumer only reaches this file through
// db/client.ts or a "server-only"-guarded lib module, so the boundary still
// holds for the app itself.
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});
