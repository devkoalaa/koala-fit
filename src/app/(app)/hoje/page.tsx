import Link from "next/link";
import { redirect } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, sets, bodyWeightLogs } from "@/db/schema";
import { toISODate, diffDays, formatDateBR } from "@/lib/date";
import { getStreakSummary, getCurrentWeekStatus } from "@/lib/streak";
import { getNextRoutine } from "@/lib/routines";
import { detectPersonalRecords } from "@/lib/personal-records";
import { buildTodayMessage } from "@/lib/insights";
import { formatWeeklyGoal } from "@/lib/weekly-goal";
import { getTopExerciseTrend } from "@/lib/trends";
import { Card } from "@/design-system/components/Card";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { EmptyState } from "@/design-system/components/EmptyState";
import { WeekStrip } from "@/components/WeekStrip";
import { StartWorkoutButton } from "./StartWorkoutButton";
import { LogWeightSheet } from "./LogWeightSheet";

export default async function HojePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = toISODate();

  const [todaysWorkout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, user.id), eq(workouts.date, today)))
    .limit(1);

  const [streak, week, nextRoutine] = await Promise.all([
    getStreakSummary(user.id),
    getCurrentWeekStatus(user.id),
    getNextRoutine(user.id),
  ]);

  let message: string;
  let todaySummary: { durationMinutes: number | null; volumeKg: number; newRecordsCount: number } | null = null;

  if (todaysWorkout?.durationMinutes != null) {
    const [{ volume }] = await db
      .select({ volume: sql<string>`coalesce(sum(${sets.weightKg} * ${sets.reps}), 0)` })
      .from(sets)
      .where(eq(sets.workoutId, todaysWorkout.id));
    const records = await detectPersonalRecords(user.id, todaysWorkout.id);
    todaySummary = {
      durationMinutes: todaysWorkout.durationMinutes,
      volumeKg: Number(volume),
      newRecordsCount: records.length,
    };
    message = buildTodayMessage({
      hasTrainedToday: true,
      weeklyDoneCount: week.doneCount,
      weeklyGoal: user.weeklyGoal,
      currentStreak: streak.currentStreak,
      daysSinceLastWorkout: null,
      newRecordsCount: records.length,
    });
  } else {
    const [lastBefore] = await db
      .select({ date: workouts.date })
      .from(workouts)
      .where(and(eq(workouts.userId, user.id), lt(workouts.date, today)))
      .orderBy(desc(workouts.date))
      .limit(1);

    const trend = await getTopExerciseTrend(user.id);

    message = buildTodayMessage({
      hasTrainedToday: false,
      weeklyDoneCount: week.doneCount,
      weeklyGoal: user.weeklyGoal,
      currentStreak: streak.currentStreak,
      daysSinceLastWorkout: lastBefore ? diffDays(lastBefore.date, today) : null,
      trend,
    });
  }

  const [latestWeight] = await db
    .select({ date: bodyWeightLogs.date, weightKg: bodyWeightLogs.weightKg })
    .from(bodyWeightLogs)
    .where(eq(bodyWeightLogs.userId, user.id))
    .orderBy(desc(bodyWeightLogs.date))
    .limit(1);
  const [firstWeight] = await db
    .select({ weightKg: bodyWeightLogs.weightKg })
    .from(bodyWeightLogs)
    .where(eq(bodyWeightLogs.userId, user.id))
    .orderBy(bodyWeightLogs.date)
    .limit(1);

  const currentWeightKg = latestWeight ? Number(latestWeight.weightKg) : null;
  const weightChange =
    currentWeightKg !== null && firstWeight ? currentWeightKg - Number(firstWeight.weightKg) : null;

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <p className="text-sm text-text-secondary">{formatDateBR(today)}</p>
        <h1 className="text-2xl font-bold text-text">{message}</h1>
      </div>

      <Card className="flex items-center gap-4">
        <ProgressRing
          value={streak.currentStreak > 0 ? 1 : 0}
          max={1}
          color="accent"
          label={
            <span className="flex flex-col items-center">
              <span className="text-xl font-bold text-text">{streak.currentStreak}</span>
              <span className="text-[10px] text-text-tertiary">ofensiva</span>
            </span>
          }
        />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-text-secondary">Essa semana</span>
            <span className="text-sm font-semibold text-text">
              {week.doneCount}/
              {user.weeklyGoal
                ? formatWeeklyGoal(user.weeklyGoal, user.weeklyGoalMax)
                : week.scheduledCount || 0}
            </span>
          </div>
          <WeekStrip days={week.days} />
          <p className="text-xs text-text-tertiary">Recorde: {streak.longestStreak}</p>
        </div>
      </Card>

      {todaysWorkout ? (
        todaySummary ? (
          <Card className="flex flex-col gap-1">
            <p className="flex items-center gap-1.5 font-semibold text-text">
              Treino de hoje concluído
              <PartyPopper className="h-5 w-5 text-accent" strokeWidth={2} aria-hidden="true" />
            </p>
            <p className="text-sm text-text-secondary">
              {todaySummary.durationMinutes} min · {Math.round(todaySummary.volumeKg)} kg de volume total
            </p>
          </Card>
        ) : (
          <Link
            href={`/treino/${todaysWorkout.id}`}
            className="block transition-transform duration-150 active:scale-[0.98]"
          >
            <Card className="border-primary/40 bg-primary-soft">
              <p className="font-semibold text-text">Treino em andamento</p>
              <p className="text-sm text-text-secondary">Toque para continuar de onde parou.</p>
            </Card>
          </Link>
        )
      ) : nextRoutine ? (
        <StartWorkoutButton routineId={nextRoutine.id} label={`Começar treino: ${nextRoutine.name}`} />
      ) : (
        <EmptyState
          title="Crie sua primeira rotina"
          description="Você precisa de uma rotina para começar a treinar."
          action={
            <Link href="/rotinas" className="text-sm font-medium text-primary">
              Ir para Rotinas →
            </Link>
          }
        />
      )}

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Peso atual</p>
          <p className="text-xl font-bold text-text">
            {currentWeightKg !== null ? `${currentWeightKg} kg` : "—"}
            {weightChange !== null && weightChange !== 0 && (
              <span className={weightChange < 0 ? "ml-2 text-sm text-primary" : "ml-2 text-sm text-accent"}>
                {weightChange > 0 ? "+" : ""}
                {weightChange.toFixed(1)} kg
              </span>
            )}
          </p>
        </div>
        <LogWeightSheet currentWeightKg={currentWeightKg} />
      </Card>
    </div>
  );
}
