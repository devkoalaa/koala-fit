import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, workouts } from "@/db/schema";

/**
 * Dupla progressão: true quando a última sessão com este exercício (antes de
 * `excludeWorkoutId`) bateu o topo da faixa de reps em todas as séries-alvo —
 * hora de subir a carga.
 */
export async function shouldSuggestProgression(
  userId: string,
  exerciseId: string,
  targetRepsMax: number | null,
  targetSets: number,
  excludeWorkoutId: string,
): Promise<boolean> {
  if (!targetRepsMax || targetSets < 1) return false;

  const [lastWorkout] = await db
    .selectDistinct({ workoutId: sets.workoutId, date: workouts.date, createdAt: workouts.createdAt })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(
      and(eq(workouts.userId, userId), eq(sets.exerciseId, exerciseId), ne(sets.workoutId, excludeWorkoutId)),
    )
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(1);

  if (!lastWorkout) return false;

  const rows = await db
    .select({ reps: sets.reps })
    .from(sets)
    .where(and(eq(sets.workoutId, lastWorkout.workoutId), eq(sets.exerciseId, exerciseId)));

  if (rows.length < targetSets) return false;
  return rows.every((r) => r.reps >= targetRepsMax);
}
