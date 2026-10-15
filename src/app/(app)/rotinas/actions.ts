"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { routines, routineExercises, exercises } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

const routineNameSchema = z.string().min(1, "Nome obrigatório").max(80);

export async function createRoutine(name: string) {
  const user = await requireUser();
  const parsed = routineNameSchema.parse(name);

  const [routine] = await db.insert(routines).values({ userId: user.id, name: parsed }).returning();
  revalidatePath("/rotinas");
  redirect(`/rotinas/${routine.id}`);
}

export async function renameRoutine(routineId: string, name: string) {
  const user = await requireUser();
  const id = z.uuid().parse(routineId);
  const parsed = routineNameSchema.parse(name);

  await db
    .update(routines)
    .set({ name: parsed, updatedAt: new Date() })
    .where(and(eq(routines.id, id), eq(routines.userId, user.id)));

  revalidatePath(`/rotinas/${id}`);
  revalidatePath("/rotinas");
}

export async function setRoutineArchived(routineId: string, archived: boolean) {
  const user = await requireUser();
  const id = z.uuid().parse(routineId);

  await db
    .update(routines)
    .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
    .where(and(eq(routines.id, id), eq(routines.userId, user.id)));

  revalidatePath(`/rotinas/${id}`);
  revalidatePath("/rotinas");
  revalidatePath("/hoje");
}

export async function deleteRoutine(routineId: string) {
  const user = await requireUser();
  const id = z.uuid().parse(routineId);

  await db.delete(routines).where(and(eq(routines.id, id), eq(routines.userId, user.id)));
  revalidatePath("/rotinas");
  redirect("/rotinas");
}

const addExerciseSchema = z.object({
  routineId: z.uuid(),
  exerciseId: z.uuid(),
});

export async function addExerciseToRoutine(input: { routineId: string; exerciseId: string }) {
  const user = await requireUser();
  const { routineId, exerciseId } = addExerciseSchema.parse(input);

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, user.id)))
    .limit(1);
  if (!owned) throw new Error("Rotina não encontrada.");

  const [exercise] = await db
    .select({ type: exercises.type })
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);
  if (!exercise) throw new Error("Exercício não encontrado.");

  const [{ nextPosition }] = await db
    .select({ nextPosition: sql<number>`coalesce(max(${routineExercises.position}), 0) + 1` })
    .from(routineExercises)
    .where(eq(routineExercises.routineId, routineId));

  if (exercise.type === "cardio") {
    await db.insert(routineExercises).values({
      routineId,
      exerciseId,
      position: nextPosition,
      targetSets: 1,
      targetDurationSeconds: 600,
    });
  } else {
    await db.insert(routineExercises).values({
      routineId,
      exerciseId,
      position: nextPosition,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
    });
  }

  revalidatePath(`/rotinas/${routineId}`);
}

export async function removeExerciseFromRoutine(routineExerciseId: string, routineId: string) {
  const user = await requireUser();
  const itemId = z.uuid().parse(routineExerciseId);
  const id = z.uuid().parse(routineId);

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, user.id)))
    .limit(1);
  if (!owned) throw new Error("Rotina não encontrada.");

  await db
    .delete(routineExercises)
    .where(and(eq(routineExercises.id, itemId), eq(routineExercises.routineId, id)));

  revalidatePath(`/rotinas/${id}`);
}

const targetsSchema = z.object({
  targetSets: z.number().int().min(1).max(20),
  targetRepsMin: z.number().int().min(1).max(100).optional(),
  targetRepsMax: z.number().int().min(1).max(100).optional(),
  targetDurationSeconds: z.number().int().min(1).optional(),
  targetDistanceMeters: z.number().min(0).optional(),
});

export async function updateRoutineExerciseTargets(
  routineExerciseId: string,
  routineId: string,
  targets: z.infer<typeof targetsSchema>,
) {
  const user = await requireUser();
  const itemId = z.uuid().parse(routineExerciseId);
  const id = z.uuid().parse(routineId);
  const parsed = targetsSchema.parse(targets);

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, user.id)))
    .limit(1);
  if (!owned) throw new Error("Rotina não encontrada.");

  await db
    .update(routineExercises)
    .set({
      targetSets: parsed.targetSets,
      targetRepsMin: parsed.targetRepsMin,
      targetRepsMax: parsed.targetRepsMax,
      targetDurationSeconds: parsed.targetDurationSeconds,
      targetDistanceMeters: parsed.targetDistanceMeters?.toString(),
    })
    .where(eq(routineExercises.id, itemId));

  revalidatePath(`/rotinas/${id}`);
}

const notesSchema = z.string().trim().max(200);

export async function updateRoutineExerciseNotes(
  routineExerciseId: string,
  routineId: string,
  notes: string,
) {
  const user = await requireUser();
  const itemId = z.uuid().parse(routineExerciseId);
  const id = z.uuid().parse(routineId);
  const parsed = notesSchema.parse(notes);

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, user.id)))
    .limit(1);
  if (!owned) throw new Error("Rotina não encontrada.");

  await db
    .update(routineExercises)
    .set({ notes: parsed || null })
    .where(and(eq(routineExercises.id, itemId), eq(routineExercises.routineId, id)));

  revalidatePath(`/rotinas/${id}`);
}

const moveDirectionSchema = z.enum(["up", "down"]);

export async function moveRoutineExercise(
  routineId: string,
  routineExerciseId: string,
  direction: "up" | "down",
) {
  const user = await requireUser();
  const id = z.uuid().parse(routineId);
  const itemId = z.uuid().parse(routineExerciseId);
  const dir = moveDirectionSchema.parse(direction);

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, user.id)))
    .limit(1);
  if (!owned) throw new Error("Rotina não encontrada.");

  const items = await db
    .select({ id: routineExercises.id, position: routineExercises.position })
    .from(routineExercises)
    .where(eq(routineExercises.routineId, id))
    .orderBy(routineExercises.position);

  const index = items.findIndex((item) => item.id === itemId);
  const swapWith = dir === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= items.length) return;

  const a = items[index];
  const b = items[swapWith];

  await db.update(routineExercises).set({ position: b.position }).where(eq(routineExercises.id, a.id));
  await db.update(routineExercises).set({ position: a.position }).where(eq(routineExercises.id, b.id));

  revalidatePath(`/rotinas/${id}`);
}
