import { redirect } from "next/navigation";
import { and, eq, gte, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, sets, exercises, bodyWeightLogs, bodyCompositionLogs, trainingSchedule } from "@/db/schema";
import { toISODate, addDays, startOfWeek, weekdayOf, formatDateBR } from "@/lib/date";
import { isPeriod, periodStartDate, type Period } from "@/lib/period";
import { Card } from "@/design-system/components/Card";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { HeatmapCalendar, type HeatmapDay } from "@/components/charts/HeatmapCalendar";
import { PeriodFilter } from "@/components/PeriodFilter";
import { BODY_METRICS, findBodyMetric, formatMetric, lastPerDay, metricValue } from "@/lib/body-composition";
import { SearchParamSelect } from "./SearchParamSelect";

const HEATMAP_WEEKS = 16;

export default async function EvolucaoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; exercise?: string; metric?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const period: Period = isPeriod(params.period) ? params.period : "12w";
  const today = toISODate();
  const periodStart = periodStartDate(period, today);

  const weightRows = await db
    .select({ date: bodyWeightLogs.date, weightKg: bodyWeightLogs.weightKg })
    .from(bodyWeightLogs)
    .where(and(eq(bodyWeightLogs.userId, user.id), periodStart ? gte(bodyWeightLogs.date, periodStart) : undefined))
    .orderBy(bodyWeightLogs.date);

  const weightPoints = weightRows.map((r) => ({
    label: formatDateBR(r.date).slice(0, 5),
    value: Number(r.weightKg),
  }));

  const compositionRows = lastPerDay(
    await db
      .select()
      .from(bodyCompositionLogs)
      .where(
        and(
          eq(bodyCompositionLogs.userId, user.id),
          periodStart ? gte(bodyCompositionLogs.date, periodStart) : undefined,
        ),
      )
      .orderBy(bodyCompositionLogs.measuredAt),
  );
  const selectedMetric = findBodyMetric(params.metric);
  const metricPoints = compositionRows.flatMap((r) => {
    const value = metricValue(r, selectedMetric);
    return value === null ? [] : [{ label: formatDateBR(r.date).slice(0, 5), value }];
  });
  const latestComposition = compositionRows.at(-1);

  const exerciseOptions = await db
    .selectDistinct({ id: exercises.id, name: exercises.name })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(and(eq(workouts.userId, user.id), eq(exercises.type, "weight")))
    .orderBy(exercises.name);

  const selectedExerciseId = params.exercise ?? exerciseOptions[0]?.id;

  const maxLoadPoints = selectedExerciseId
    ? (
        await db
          .select({ date: workouts.date, maxWeight: sql<string>`max(${sets.weightKg})` })
          .from(sets)
          .innerJoin(workouts, eq(sets.workoutId, workouts.id))
          .where(
            and(
              eq(workouts.userId, user.id),
              eq(sets.exerciseId, selectedExerciseId),
              periodStart ? gte(workouts.date, periodStart) : undefined,
            ),
          )
          .groupBy(workouts.date)
          .orderBy(workouts.date)
      ).map((r) => ({ label: formatDateBR(r.date).slice(0, 5), value: Number(r.maxWeight) }))
    : [];

  const weeklyVolumeRows = await db
    .select({
      weekStart: sql<string>`date_trunc('week', ${workouts.date}::date)::date`,
      volume: sql<string>`sum(${sets.weightKg} * ${sets.reps})`,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(and(eq(workouts.userId, user.id), periodStart ? gte(workouts.date, periodStart) : undefined))
    .groupBy(sql`date_trunc('week', ${workouts.date}::date)`)
    .orderBy(sql`date_trunc('week', ${workouts.date}::date)`);

  const volumeBars = weeklyVolumeRows.map((r) => ({
    label: formatDateBR(r.weekStart).slice(0, 5),
    value: Number(r.volume),
  }));

  const scheduleRows = await db
    .select({ weekday: trainingSchedule.weekday })
    .from(trainingSchedule)
    .where(eq(trainingSchedule.userId, user.id));
  const schedule = new Set(scheduleRows.map((r) => r.weekday));

  const allWorkoutDateRows = await db
    .selectDistinct({ date: workouts.date })
    .from(workouts)
    .where(eq(workouts.userId, user.id));
  const workoutDateSet = new Set(allWorkoutDateRows.map((r) => r.date));

  const thisWeekStart = startOfWeek(today);
  const heatmapStart = addDays(thisWeekStart, -(HEATMAP_WEEKS - 1) * 7);
  const heatmapWeeks: HeatmapDay[][] = Array.from({ length: HEATMAP_WEEKS }, (_, w) => {
    const weekStart = addDays(heatmapStart, w * 7);
    return Array.from({ length: 7 }, (_, d) => {
      const date = addDays(weekStart, d);
      let status: HeatmapDay["status"];
      if (date > today) status = "future";
      else if (workoutDateSet.has(date)) status = "trained";
      else if (schedule.has(weekdayOf(date))) status = "missed";
      else status = "off-schedule";
      return { date, status };
    });
  });

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-text">Evolução</h1>

      <PeriodFilter current={period} />

      <Card>
        <p className="mb-2 font-semibold text-text">Peso corporal</p>
        <LineChart points={weightPoints} unit="kg" emptyLabel="Registre seu peso para ver o gráfico" />
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-semibold text-text">Composição corporal</p>
          {latestComposition && (
            <p className="text-xs text-text-tertiary">Última: {formatDateBR(latestComposition.date)}</p>
          )}
        </div>
        {latestComposition ? (
          <div className="flex flex-col gap-3">
            <SearchParamSelect
              param="metric"
              options={BODY_METRICS.map((m) => ({ id: m.id, name: m.label }))}
              current={selectedMetric.id}
            />
            <LineChart points={metricPoints} unit={selectedMetric.unit} />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {BODY_METRICS.map((m) => {
                const value = metricValue(latestComposition, m);
                if (value === null) return null;
                return (
                  <div key={m.id} className="flex justify-between gap-2">
                    <dt className="text-text-secondary">{m.label}</dt>
                    <dd className="font-medium text-text tabular-nums">{formatMetric(value, m)}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-text-tertiary">
            Encaminhe o relatório da balança para o bot do Telegram para ver esse gráfico.
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-semibold text-text">Carga máxima</p>
        </div>
        {exerciseOptions.length > 0 && selectedExerciseId ? (
          <div className="flex flex-col gap-3">
            <SearchParamSelect param="exercise" options={exerciseOptions} current={selectedExerciseId} />
            <LineChart points={maxLoadPoints} unit="kg" />
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-text-tertiary">
            Registre séries com carga para ver esse gráfico.
          </p>
        )}
      </Card>

      <Card>
        <p className="mb-2 font-semibold text-text">Volume semanal</p>
        <BarChart bars={volumeBars} unit="kg" />
      </Card>

      <Card>
        <p className="mb-2 font-semibold text-text">Constância</p>
        <HeatmapCalendar weeks={heatmapWeeks} />
      </Card>
    </div>
  );
}
