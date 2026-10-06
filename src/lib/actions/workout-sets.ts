"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, cardioSessions, workouts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

// Shared by the in-progress workout screen (treino/[workoutId]) and the
// finished-workout edit UI (historico/[workoutId]) — editing a past workout
// is just the same set/cardio logging, no "is this still in progress" gate.
export async function requireOwnedWorkout(workoutIdInput: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const workoutId = z.uuid().parse(workoutIdInput);

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
    .limit(1);
  if (!workout) throw new Error("Treino não encontrado.");

  return { user, workout, workoutId };
}

function revalidateWorkoutPaths(workoutId: string) {
  revalidatePath(`/treino/${workoutId}`);
  revalidatePath(`/historico/${workoutId}`);
  revalidatePath("/evolucao");
}

const setSchema = z.object({
  exerciseId: z.uuid(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).max(200),
  weightKg: z.number().min(0).max(999),
});

export async function logSet(workoutIdInput: string, input: z.infer<typeof setSchema>) {
  const { workoutId } = await requireOwnedWorkout(workoutIdInput);
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

  revalidateWorkoutPaths(workoutId);
}

const deleteSetSchema = z.object({
  exerciseId: z.uuid(),
  setNumber: z.number().int().min(1),
});

export async function deleteSet(workoutIdInput: string, exerciseId: string, setNumber: number) {
  const { workoutId } = await requireOwnedWorkout(workoutIdInput);
  const parsed = deleteSetSchema.parse({ exerciseId, setNumber });

  await db
    .delete(sets)
    .where(
      and(
        eq(sets.workoutId, workoutId),
        eq(sets.exerciseId, parsed.exerciseId),
        eq(sets.setNumber, parsed.setNumber),
      ),
    );
  revalidateWorkoutPaths(workoutId);
}

// `entryNumber` separa blocos do mesmo cardio dentro de um treino (5 min de
// esteira no aquecimento + 15 min no fim) — mesmo papel do `setNumber` da
// musculação. Quem não passa nada continua escrevendo no bloco 1.
const cardioSchema = z.object({
  exerciseId: z.uuid(),
  entryNumber: z.number().int().min(1).max(1000).default(1),
  durationSeconds: z.number().int().min(1),
  distanceMeters: z.number().min(0).optional(),
  inclinePercent: z.number().min(0).max(50).optional(),
});

export async function logCardio(workoutIdInput: string, input: z.input<typeof cardioSchema>) {
  const { workoutId } = await requireOwnedWorkout(workoutIdInput);
  const parsed = cardioSchema.parse(input);

  await db
    .insert(cardioSessions)
    .values({
      workoutId,
      exerciseId: parsed.exerciseId,
      entryNumber: parsed.entryNumber,
      durationSeconds: parsed.durationSeconds,
      distanceMeters: parsed.distanceMeters?.toString() ?? null,
      inclinePercent: parsed.inclinePercent?.toString() ?? null,
    })
    .onConflictDoUpdate({
      target: [cardioSessions.workoutId, cardioSessions.exerciseId, cardioSessions.entryNumber],
      set: {
        durationSeconds: parsed.durationSeconds,
        distanceMeters: parsed.distanceMeters?.toString() ?? null,
        inclinePercent: parsed.inclinePercent?.toString() ?? null,
      },
    });

  revalidateWorkoutPaths(workoutId);
}

const deleteCardioSchema = z.object({
  exerciseId: z.uuid(),
  entryNumber: z.number().int().min(1).max(1000),
});

export async function deleteCardio(workoutIdInput: string, exerciseId: string, entryNumber: number) {
  const { workoutId } = await requireOwnedWorkout(workoutIdInput);
  const parsed = deleteCardioSchema.parse({ exerciseId, entryNumber });

  await db
    .delete(cardioSessions)
    .where(
      and(
        eq(cardioSessions.workoutId, workoutId),
        eq(cardioSessions.exerciseId, parsed.exerciseId),
        eq(cardioSessions.entryNumber, parsed.entryNumber),
      ),
    );

  revalidateWorkoutPaths(workoutId);
}

const feelingSchema = z.number().int().min(1).max(5);

export async function updateWorkoutFeeling(workoutIdInput: string, feelingInput: number) {
  const { workoutId } = await requireOwnedWorkout(workoutIdInput);
  const feeling = feelingSchema.parse(feelingInput);

  await db.update(workouts).set({ feeling }).where(eq(workouts.id, workoutId));
  revalidateWorkoutPaths(workoutId);
}

// Sets and cardio_sessions cascade on workouts.id, so this is a single
// query. Works for both an in-progress workout (started by mistake) and a
// finished one — the caller decides where to navigate afterward.
export async function deleteWorkout(workoutIdInput: string) {
  const { workoutId } = await requireOwnedWorkout(workoutIdInput);

  await db.delete(workouts).where(eq(workouts.id, workoutId));

  revalidatePath("/hoje");
  revalidatePath("/historico");
  revalidatePath("/evolucao");
}
