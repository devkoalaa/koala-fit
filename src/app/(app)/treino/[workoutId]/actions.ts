"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, workouts } from "@/db/schema";
import { reconcileStreak } from "@/lib/streak";
import { detectPersonalRecords, type PersonalRecord } from "@/lib/personal-records";
import { requireOwnedWorkout } from "@/lib/actions/workout-sets";

export type FinishWorkoutResult = {
  durationMinutes: number;
  volumeKg: number;
  records: PersonalRecord[];
};

const feelingSchema = z.number().int().min(1).max(5);

export async function finishWorkout(
  workoutIdInput: string,
  feelingInput: number,
): Promise<FinishWorkoutResult> {
  const { user, workout, workoutId } = await requireOwnedWorkout(workoutIdInput);
  const feeling = feelingSchema.parse(feelingInput);

  const durationMinutes = Math.max(1, Math.round((Date.now() - workout.createdAt.getTime()) / 60_000));

  await db.update(workouts).set({ durationMinutes, feeling }).where(eq(workouts.id, workoutId));

  const [{ volume }] = await db
    .select({ volume: sql<string>`coalesce(sum(${sets.weightKg} * ${sets.reps}), 0)` })
    .from(sets)
    .where(eq(sets.workoutId, workoutId));

  const records = await detectPersonalRecords(user.id, workoutId);
  await reconcileStreak(user.id);

  revalidatePath("/hoje");
  revalidatePath(`/treino/${workoutId}`);

  return { durationMinutes, volumeKg: Number(volume), records };
}
