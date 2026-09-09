import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, workouts } from "@/db/schema";

/**
 * True when the last 2 sessions with this exercise (before `excludeWorkoutId`)
 * both hit every target set at-or-above the top of the target rep range —
 * i.e. there's room to add weight next time.
 */
export async function shouldSuggestProgression(
  userId: string,
  exerciseId: string,
  targetRepsMax: number | null,
  targetSets: number,
  excludeWorkoutId: string,
): Promise<boolean> {
  if (!targetRepsMax || targetSets < 1) return false;

  const recentWorkouts = await db
    .selectDistinct({ workoutId: sets.workoutId, date: workouts.date })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(
      and(eq(workouts.userId, userId), eq(sets.exerciseId, exerciseId), ne(sets.workoutId, excludeWorkoutId)),
    )
    .orderBy(desc(workouts.date))
    .limit(2);

  if (recentWorkouts.length < 2) return false;

  for (const w of recentWorkouts) {
    const rows = await db
      .select({ reps: sets.reps })
      .from(sets)
      .where(and(eq(sets.workoutId, w.workoutId), eq(sets.exerciseId, exerciseId)));

    if (rows.length < targetSets) return false;
    if (rows.some((r) => r.reps < targetRepsMax)) return false;
  }

  return true;
}
