import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = typeof users.$inferSelect;

export async function createSession(userId: string): Promise<void> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ userId, tokenHash, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// cache() dedupes this within a single request's render tree (layout + page
// both call it without triggering two DB round trips).
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return rows[0]?.user ?? null;
});

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  cookieStore.delete(SESSION_COOKIE);
}
