import "server-only";
import { and, asc, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  users,
  trainingSchedule,
  bodyWeightLogs,
  workouts,
  routines,
  sets,
  exercises,
  cardioSessions,
} from "@/db/schema";
import { getStreakSummary } from "@/lib/streak";
import { getAllTimePersonalRecords } from "@/lib/personal-records";
import { toISODate } from "@/lib/date";
import { periodStartDate, type Period } from "@/lib/period";

export type ExportData = {
  exported_at: string;
  profile: { height_cm: number | null; training_days: string[]; goal: string };
  body_weight: { date: string; kg: number }[];
  streak: { current: number; longest: number };
  workouts: {
    date: string;
    routine: string;
    duration_min: number | null;
    feeling: number | null;
    exercises: { name: string; sets: { reps: number; weight_kg: number }[] }[];
    cardio: { type: string; minutes: number; incline_pct: number | null; km: number | null }[];
  }[];
  personal_records: { exercise: string; metric: string; value: number; date: string }[];
};

export async function buildExportData(userId: string, period: Period): Promise<ExportData> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  const scheduleRows = await db
    .select({ weekday: trainingSchedule.weekday })
    .from(trainingSchedule)
    .where(eq(trainingSchedule.userId, userId));

  const today = toISODate();
  const periodStart = periodStartDate(period, today);

  const weightRows = await db
    .select({ date: bodyWeightLogs.date, weightKg: bodyWeightLogs.weightKg })
    .from(bodyWeightLogs)
    .where(and(eq(bodyWeightLogs.userId, userId), periodStart ? gte(bodyWeightLogs.date, periodStart) : undefined))
    .orderBy(asc(bodyWeightLogs.date));

  const streak = await getStreakSummary(userId);

  const workoutRows = await db
    .select({
      id: workouts.id,
      date: workouts.date,
      durationMinutes: workouts.durationMinutes,
      feeling: workouts.feeling,
      routineName: routines.name,
    })
    .from(workouts)
    .leftJoin(routines, eq(workouts.routineId, routines.id))
    .where(
      and(
        eq(workouts.userId, userId),
        isNotNull(workouts.durationMinutes),
        periodStart ? gte(workouts.date, periodStart) : undefined,
      ),
    )
    .orderBy(asc(workouts.date));

  const exportedWorkouts = await Promise.all(
    workoutRows.map(async (w) => {
      const setRows = await db
        .select({ exerciseName: exercises.name, reps: sets.reps, weightKg: sets.weightKg })
        .from(sets)
        .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
        .where(eq(sets.workoutId, w.id))
        .orderBy(exercises.name, sets.setNumber);

      const exerciseMap = new Map<string, { reps: number; weight_kg: number }[]>();
      for (const s of setRows) {
        const arr = exerciseMap.get(s.exerciseName) ?? [];
        arr.push({ reps: s.reps, weight_kg: Number(s.weightKg) });
        exerciseMap.set(s.exerciseName, arr);
      }

      const cardioRows = await db
        .select({
          exerciseName: exercises.name,
          durationSeconds: cardioSessions.durationSeconds,
          distanceMeters: cardioSessions.distanceMeters,
          inclinePercent: cardioSessions.inclinePercent,
        })
        .from(cardioSessions)
        .innerJoin(exercises, eq(cardioSessions.exerciseId, exercises.id))
        .where(eq(cardioSessions.workoutId, w.id));

      return {
        date: w.date,
        routine: w.routineName ?? "Treino livre",
        duration_min: w.durationMinutes,
        feeling: w.feeling,
        exercises: Array.from(exerciseMap.entries()).map(([name, exerciseSets]) => ({
          name,
          sets: exerciseSets,
        })),
        cardio: cardioRows.map((c) => ({
          type: c.exerciseName,
          minutes: Math.round(c.durationSeconds / 60),
          incline_pct: c.inclinePercent != null ? Number(c.inclinePercent) : null,
          km: c.distanceMeters != null ? Number(c.distanceMeters) / 1000 : null,
        })),
      };
    }),
  );

  const records = await getAllTimePersonalRecords(userId);

  return {
    exported_at: new Date().toISOString(),
    profile: {
      height_cm: user.heightCm,
      training_days: scheduleRows.map((r) => r.weekday),
      goal: `${user.weeklyGoal}x por semana`,
    },
    body_weight: weightRows.map((r) => ({ date: r.date, kg: Number(r.weightKg) })),
    streak: { current: streak.currentStreak, longest: streak.longestStreak },
    workouts: exportedWorkouts,
    personal_records: records.map((r) => ({
      exercise: r.exerciseName,
      metric: r.metric,
      value: r.value,
      date: r.date,
    })),
  };
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function buildSetsCsv(userId: string, period: Period): Promise<string> {
  const today = toISODate();
  const periodStart = periodStartDate(period, today);

  const rows = await db
    .select({
      date: workouts.date,
      exerciseName: exercises.name,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        isNotNull(workouts.durationMinutes),
        periodStart ? gte(workouts.date, periodStart) : undefined,
      ),
    )
    .orderBy(asc(workouts.date), exercises.name, sets.setNumber);

  const header = "date,exercise,set,reps,weight_kg";
  const lines = rows.map(
    (r) => `${r.date},${csvEscape(r.exerciseName)},${r.setNumber},${r.reps},${r.weightKg}`,
  );
  return [header, ...lines].join("\n");
}
