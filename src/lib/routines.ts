import "server-only";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { routines, workouts } from "@/db/schema";

export type RoutineOption = { id: string; name: string };

export type RoutineChoices = { routines: RoutineOption[]; next: RoutineOption | null };

/**
 * Routines rotate in creation order; "next" continues from the routine of the
 * last workout — finished or not, since a workout left open still counts as a
 * training day everywhere else (week strip, streak). Archived routines are
 * left out; if the last workout used one, the rotation restarts at the first.
 */
export async function getRoutineChoices(userId: string): Promise<RoutineChoices> {
  const userRoutines = await db
    .select({ id: routines.id, name: routines.name })
    .from(routines)
    .where(and(eq(routines.userId, userId), isNull(routines.archivedAt)))
    .orderBy(routines.createdAt);

  if (userRoutines.length === 0) return { routines: [], next: null };

  const [lastWorkout] = await db
    .select({ routineId: workouts.routineId })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), isNotNull(workouts.routineId)))
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(1);

  const idx = lastWorkout?.routineId
    ? userRoutines.findIndex((r) => r.id === lastWorkout.routineId)
    : -1;
  const next = idx === -1 ? userRoutines[0] : userRoutines[(idx + 1) % userRoutines.length];

  return { routines: userRoutines, next };
}
