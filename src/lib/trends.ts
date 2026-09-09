import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { sets, workouts, exercises } from "@/db/schema";
import { addDays, toISODate } from "@/lib/date";

export type ExerciseTrend = { exerciseName: string; deltaKg: number; weeks: number };

/**
 * Exercise whose max weight rose the most between its earliest and most
 * recent session within the last `weeks` weeks — powers the "X subiu Ykg
 * nas últimas Z semanas" contextual message on Hoje.
 */
export async function getTopExerciseTrend(userId: string, weeks = 4): Promise<ExerciseTrend | null> {
  const today = toISODate();
  const periodStart = addDays(today, -weeks * 7);

  const rows = await db
    .select({
      exerciseId: sets.exerciseId,
      exerciseName: exercises.name,
      date: workouts.date,
      weightKg: sets.weightKg,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(and(eq(workouts.userId, userId), eq(exercises.type, "weight"), gte(workouts.date, periodStart)));

  const byExercise = new Map<string, { name: string; byDate: Map<string, number> }>();
  for (const r of rows) {
    const weight = Number(r.weightKg);
    let entry = byExercise.get(r.exerciseId);
    if (!entry) {
      entry = { name: r.exerciseName, byDate: new Map() };
      byExercise.set(r.exerciseId, entry);
    }
    entry.byDate.set(r.date, Math.max(entry.byDate.get(r.date) ?? 0, weight));
  }

  let best: ExerciseTrend | null = null;
  for (const entry of byExercise.values()) {
    const dates = Array.from(entry.byDate.keys()).sort();
    if (dates.length < 2) continue;

    const earliest = entry.byDate.get(dates[0])!;
    const latest = entry.byDate.get(dates[dates.length - 1])!;
    const delta = latest - earliest;

    if (delta > 0 && (!best || delta > best.deltaKg)) {
      best = { exerciseName: entry.name, deltaKg: delta, weeks };
    }
  }

  return best;
}
