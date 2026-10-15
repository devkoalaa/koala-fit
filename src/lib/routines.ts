import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import { routines, workouts } from "@/db/schema";

export type RoutineOption = { id: string; name: string };

export type RoutineChoices = { routines: RoutineOption[]; next: RoutineOption | null };

/** Routines rotate in creation order; "next" continues from whatever routine was last completed. */
export async function getRoutineChoices(userId: string): Promise<RoutineChoices> {
  const userRoutines = await db
    .select({ id: routines.id, name: routines.name })
    .from(routines)
    .where(eq(routines.userId, userId))
    .orderBy(routines.createdAt);

  if (userRoutines.length === 0) return { routines: [], next: null };

  const [lastFinished] = await db
    .select({ routineId: workouts.routineId })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), isNotNull(workouts.durationMinutes)))
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(1);

  const idx = lastFinished?.routineId
    ? userRoutines.findIndex((r) => r.id === lastFinished.routineId)
    : -1;
  const next = idx === -1 ? userRoutines[0] : userRoutines[(idx + 1) % userRoutines.length];

  return { routines: userRoutines, next };
}
