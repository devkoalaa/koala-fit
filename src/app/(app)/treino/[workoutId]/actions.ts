"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { cardioSessions, exercises, sets, workouts } from "@/db/schema";
import { reconcileStreak } from "@/lib/streak";
import { detectPersonalRecords, type PersonalRecord } from "@/lib/personal-records";
import { requireOwnedWorkout } from "@/lib/actions/workout-sets";
import { buildExtraSession } from "./extra-exercise";
import type { ExerciseSession } from "./types";

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

export async function loadExtraExercise(
  workoutIdInput: string,
  exerciseIdInput: string,
): Promise<ExerciseSession> {
  const { user, workoutId } = await requireOwnedWorkout(workoutIdInput);
  const exerciseId = z.uuid().parse(exerciseIdInput);

  const [exercise] = await db
    .select({ id: exercises.id, name: exercises.name, type: exercises.type })
    .from(exercises)
    .where(and(eq(exercises.id, exerciseId), or(isNull(exercises.userId), eq(exercises.userId, user.id))))
    .limit(1);
  if (!exercise) throw new Error("Exercício não encontrado.");

  const setRows = await db
    .select()
    .from(sets)
    .where(and(eq(sets.workoutId, workoutId), eq(sets.exerciseId, exerciseId)));
  const cardioRows = await db
    .select()
    .from(cardioSessions)
    .where(and(eq(cardioSessions.workoutId, workoutId), eq(cardioSessions.exerciseId, exerciseId)));

  return buildExtraSession(user.id, workoutId, exercise, setRows, cardioRows);
}
