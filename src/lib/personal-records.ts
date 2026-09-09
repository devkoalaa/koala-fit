import "server-only";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { exercises, sets, workouts } from "@/db/schema";

export type PersonalRecordMetric = "max_weight" | "max_reps" | "max_volume";

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  metric: PersonalRecordMetric;
  value: number;
  date: string;
};

/**
 * Compares every weight-type exercise trained in `workoutId` against the
 * user's best-ever performance on that exercise from all other workouts.
 * Called right after a workout is finished to surface "record beaten" toasts.
 */
export async function detectPersonalRecords(
  userId: string,
  workoutId: string,
): Promise<PersonalRecord[]> {
  const [workout] = await db
    .select({ date: workouts.date })
    .from(workouts)
    .where(eq(workouts.id, workoutId))
    .limit(1);
  if (!workout) return [];

  const todayExercises = await db
    .selectDistinct({ exerciseId: sets.exerciseId, name: exercises.name })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(and(eq(sets.workoutId, workoutId), eq(exercises.type, "weight")));

  const records: PersonalRecord[] = [];

  for (const { exerciseId, name } of todayExercises) {
    const [todayAgg] = await db
      .select({
        maxWeight: sql<string | null>`max(${sets.weightKg})`,
        maxReps: sql<number | null>`max(${sets.reps})`,
        volume: sql<string | null>`sum(${sets.weightKg} * ${sets.reps})`,
      })
      .from(sets)
      .where(and(eq(sets.workoutId, workoutId), eq(sets.exerciseId, exerciseId)));

    const [prevBest] = await db
      .select({
        maxWeight: sql<string | null>`max(${sets.weightKg})`,
        maxReps: sql<number | null>`max(${sets.reps})`,
      })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(
        and(eq(workouts.userId, userId), eq(sets.exerciseId, exerciseId), ne(sets.workoutId, workoutId)),
      );

    const prevVolumeRows = await db
      .select({ volume: sql<string>`sum(${sets.weightKg} * ${sets.reps})` })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(
        and(eq(workouts.userId, userId), eq(sets.exerciseId, exerciseId), ne(sets.workoutId, workoutId)),
      )
      .groupBy(sets.workoutId);

    const todayWeight = Number(todayAgg?.maxWeight ?? 0);
    const todayReps = Number(todayAgg?.maxReps ?? 0);
    const todayVolume = Number(todayAgg?.volume ?? 0);

    const prevWeight = prevBest?.maxWeight != null ? Number(prevBest.maxWeight) : null;
    const prevReps = prevBest?.maxReps != null ? Number(prevBest.maxReps) : null;
    const prevMaxVolume = prevVolumeRows.reduce((max, r) => Math.max(max, Number(r.volume)), 0);

    if (prevWeight !== null && todayWeight > prevWeight) {
      records.push({ exerciseId, exerciseName: name, metric: "max_weight", value: todayWeight, date: workout.date });
    }
    if (prevReps !== null && todayReps > prevReps) {
      records.push({ exerciseId, exerciseName: name, metric: "max_reps", value: todayReps, date: workout.date });
    }
    if (prevVolumeRows.length > 0 && todayVolume > prevMaxVolume) {
      records.push({ exerciseId, exerciseName: name, metric: "max_volume", value: todayVolume, date: workout.date });
    }
  }

  return records;
}

/** All-time best (max weight) per weight-type exercise (used by Evolução + export). */
export async function getAllTimePersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const maxRows = await db
    .select({
      exerciseId: sets.exerciseId,
      exerciseName: exercises.name,
      maxWeight: sql<string | null>`max(${sets.weightKg})`,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(and(eq(workouts.userId, userId), eq(exercises.type, "weight")))
    .groupBy(sets.exerciseId, exercises.name);

  const records: PersonalRecord[] = [];
  for (const row of maxRows) {
    if (row.maxWeight == null) continue;

    const [achieved] = await db
      .select({ date: workouts.date })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(
        and(
          eq(workouts.userId, userId),
          eq(sets.exerciseId, row.exerciseId),
          eq(sets.weightKg, row.maxWeight),
        ),
      )
      .orderBy(desc(workouts.date))
      .limit(1);

    records.push({
      exerciseId: row.exerciseId,
      exerciseName: row.exerciseName,
      metric: "max_weight",
      value: Number(row.maxWeight),
      date: achieved?.date ?? "",
    });
  }
  return records;
}
