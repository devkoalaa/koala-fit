import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import { routines, workouts } from "@/db/schema";

export type NextRoutine = { id: string; name: string } | null;

/** Routines rotate in creation order; "next" continues from whatever routine was last completed. */
export async function getNextRoutine(userId: string): Promise<NextRoutine> {
  const userRoutines = await db
    .select({ id: routines.id, name: routines.name })
    .from(routines)
    .where(eq(routines.userId, userId))
    .orderBy(routines.createdAt);

  if (userRoutines.length === 0) return null;

  const [lastFinished] = await db
    .select({ routineId: workouts.routineId })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), isNotNull(workouts.durationMinutes)))
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(1);

  if (!lastFinished?.routineId) return userRoutines[0];

  const idx = userRoutines.findIndex((r) => r.id === lastFinished.routineId);
  if (idx === -1) return userRoutines[0];

  return userRoutines[(idx + 1) % userRoutines.length];
}
