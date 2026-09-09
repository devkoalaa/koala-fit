"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, cardioSessions, workouts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { reconcileStreak } from "@/lib/streak";
import { detectPersonalRecords, type PersonalRecord } from "@/lib/personal-records";

async function requireOwnedWorkout(workoutId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
    .limit(1);
  if (!workout) throw new Error("Treino não encontrado.");

  return { user, workout };
}

const setSchema = z.object({
  exerciseId: z.uuid(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).max(200),
  weightKg: z.number().min(0).max(999),
});

export async function logSet(workoutId: string, input: z.infer<typeof setSchema>) {
  await requireOwnedWorkout(workoutId);
  const parsed = setSchema.parse(input);

  await db
    .insert(sets)
    .values({
      workoutId,
      exerciseId: parsed.exerciseId,
      setNumber: parsed.setNumber,
      reps: parsed.reps,
      weightKg: parsed.weightKg.toString(),
    })
    .onConflictDoUpdate({
      target: [sets.workoutId, sets.exerciseId, sets.setNumber],
      set: { reps: parsed.reps, weightKg: parsed.weightKg.toString() },
    });

  revalidatePath(`/treino/${workoutId}`);
}

export async function deleteSet(workoutId: string, exerciseId: string, setNumber: number) {
  await requireOwnedWorkout(workoutId);
  await db
    .delete(sets)
    .where(
      and(eq(sets.workoutId, workoutId), eq(sets.exerciseId, exerciseId), eq(sets.setNumber, setNumber)),
    );
  revalidatePath(`/treino/${workoutId}`);
}

const cardioSchema = z.object({
  exerciseId: z.uuid(),
  durationSeconds: z.number().int().min(1),
  distanceMeters: z.number().min(0).optional(),
  inclinePercent: z.number().min(0).max(50).optional(),
});

export async function logCardio(workoutId: string, input: z.infer<typeof cardioSchema>) {
  await requireOwnedWorkout(workoutId);
  const parsed = cardioSchema.parse(input);

  await db
    .delete(cardioSessions)
    .where(and(eq(cardioSessions.workoutId, workoutId), eq(cardioSessions.exerciseId, parsed.exerciseId)));

  await db.insert(cardioSessions).values({
    workoutId,
    exerciseId: parsed.exerciseId,
    durationSeconds: parsed.durationSeconds,
    distanceMeters: parsed.distanceMeters?.toString(),
    inclinePercent: parsed.inclinePercent?.toString(),
  });

  revalidatePath(`/treino/${workoutId}`);
}

export type FinishWorkoutResult = {
  durationMinutes: number;
  volumeKg: number;
  records: PersonalRecord[];
};

export async function finishWorkout(workoutId: string, feeling: number): Promise<FinishWorkoutResult> {
  const { user, workout } = await requireOwnedWorkout(workoutId);

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
