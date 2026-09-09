import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, workouts } from "@/db/schema";

export type LastSetPerformance = { setNumber: number; reps: number; weightKg: number };

/** Sets logged for `exerciseId` in the user's most recent workout before `excludeWorkoutId`. */
export async function getLastPerformance(
  userId: string,
  exerciseId: string,
  excludeWorkoutId: string,
): Promise<LastSetPerformance[]> {
  const [lastWorkout] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .innerJoin(sets, eq(sets.workoutId, workouts.id))
    .where(
      and(eq(workouts.userId, userId), eq(sets.exerciseId, exerciseId), ne(workouts.id, excludeWorkoutId)),
    )
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(1);

  if (!lastWorkout) return [];

  const rows = await db
    .select({ setNumber: sets.setNumber, reps: sets.reps, weightKg: sets.weightKg })
    .from(sets)
    .where(and(eq(sets.workoutId, lastWorkout.id), eq(sets.exerciseId, exerciseId)))
    .orderBy(sets.setNumber);

  return rows.map((r) => ({ setNumber: r.setNumber, reps: r.reps, weightKg: Number(r.weightKg) }));
}
