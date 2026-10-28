import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, gte, lte } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { foodLogs } from "@/db/schema";
import { Card } from "@/design-system/components/Card";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import { BarChart } from "@/components/charts/BarChart";
import { addDays, daysBetween, formatDateBR, toISODate, weekdayOf, WEEKDAY_LABEL_PT, APP_TIMEZONE } from "@/lib/date";
import { cn } from "@/lib/cn";
import { MEAL_ORDER, NUTRIENTS, formatAmount, goalOf, totalsOf } from "@/lib/nutrition";
import { FoodLogItem, type FoodLogEntry } from "./FoodLogItem";
import { NutritionGoalsSheet, type Goals } from "./NutritionGoalsSheet";

const WEEK_DAYS = 7;

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: APP_TIMEZONE, hour: "2-digit", minute: "2-digit" });

function dayLabel(day: string, today: string): string {
  if (day === today) return "Hoje";
  if (day === addDays(today, -1)) return "Ontem";
  return `${WEEKDAY_LABEL_PT[weekdayOf(day)]}, ${formatDateBR(day).slice(0, 5)}`;
}

export default async function AlimentacaoPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = toISODate();
  const { dia } = await searchParams;
  const day = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) && dia <= today ? dia : today;
  const weekStart = addDays(day, -(WEEK_DAYS - 1));

  const weekRows = await db
    .select()
    .from(foodLogs)
    .where(and(eq(foodLogs.userId, user.id), gte(foodLogs.date, weekStart), lte(foodLogs.date, day)))
    .orderBy(foodLogs.eatenAt);

  const dayRows = weekRows.filter((r) => r.date === day);
  const totals = totalsOf(dayRows);
  const kcalGoal = user.kcalGoal;
  const goals = Object.fromEntries(NUTRIENTS.map((n) => [n.goalKey, goalOf(user, n)])) as Goals;

  // Refeições na ordem do dia; as que o bot não reconheceu vão para "Outros".
  const meals = new Map<string, FoodLogEntry[]>();
  for (const r of dayRows) {
    const meal = r.meal ?? "Outros";
    const entry: FoodLogEntry = {
      id: r.id,
      time: timeFormatter.format(r.eatenAt),
      description: r.description,
      quantity: r.quantity,
      kcal: r.kcal,
      proteinG: r.proteinG === null ? null : Number(r.proteinG),
      carbsG: r.carbsG === null ? null : Number(r.carbsG),
      fatG: r.fatG === null ? null : Number(r.fatG),
      waterMl: r.waterMl,
      fromPhoto: r.source === "telegram-foto",
    };
    meals.set(meal, [...(meals.get(meal) ?? []), entry]);
  }
  const mealGroups = [...meals.entries()].sort(
    ([a], [b]) => (MEAL_ORDER.indexOf(a) + 1 || 99) - (MEAL_ORDER.indexOf(b) + 1 || 99),
  );

  const weekDays = daysBetween(weekStart, day);
  const kcalBars = weekDays.map((d) => ({
    label: WEEKDAY_LABEL_PT[weekdayOf(d)],
    value: totalsOf(weekRows.filter((r) => r.date === d)).kcal,
  }));
  // Médias só dos dias com registro, para um dia esquecido não puxar para baixo.
  const loggedDays = weekDays.filter((d) => weekRows.some((r) => r.date === d && r.kcal > 0));
  const weekTotals = totalsOf(weekRows);
  const avgKcal = loggedDays.length > 0 ? weekTotals.kcal / loggedDays.length : null;
  const avgProtein = loggedDays.length > 0 ? weekTotals.protein / loggedDays.length : null;

  const prev = addDays(day, -1);
  const next = day < today ? addDays(day, 1) : null;

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-text">Alimentação</h1>
        <NutritionGoalsSheet goals={goals} />
      </div>

      <div className="flex items-center justify-between rounded-md bg-surface p-1">
        <Link
          href={`/alimentacao?dia=${prev}`}
          aria-label="Dia anterior"
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary active:bg-bg-elevated"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </Link>
        <span className="text-sm font-semibold text-text">{dayLabel(day, today)}</span>
        {next ? (
          <Link
            href={next === today ? "/alimentacao" : `/alimentacao?dia=${next}`}
            aria-label="Próximo dia"
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary active:bg-bg-elevated"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </Link>
        ) : (
          <span className="h-9 w-9" />
        )}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={totals.kcal}
            max={kcalGoal ?? 0}
            size={96}
            strokeWidth={10}
            label={
              <span className="flex flex-col items-center leading-tight">
                <span className="text-lg font-bold text-text tabular-nums">{totals.kcal.toLocaleString("pt-BR")}</span>
                <span className="text-[10px] text-text-tertiary">kcal</span>
              </span>
            }
          />
          <div className="flex flex-col gap-0.5">
            {kcalGoal ? (
              <>
                <p className="text-sm text-text-secondary">Meta {kcalGoal.toLocaleString("pt-BR")} kcal</p>
                <p
                  className={cn(
                    "text-lg font-semibold tabular-nums",
                    totals.kcal > kcalGoal ? "text-danger" : "text-text",
                  )}
                >
                  {totals.kcal > kcalGoal
                    ? `${(totals.kcal - kcalGoal).toLocaleString("pt-BR")} acima`
                    : `Faltam ${(kcalGoal - totals.kcal).toLocaleString("pt-BR")}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-text-secondary">Defina as metas para ver quanto falta.</p>
            )}
          </div>
        </div>

        <dl className="flex flex-col gap-2.5">
          {NUTRIENTS.filter((n) => n.key !== "kcal").map((n) => {
            const value = totals[n.key];
            const goal = goalOf(user, n);
            const pct = goal ? Math.min(100, (value / goal) * 100) : 0;
            return (
              <div key={n.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <dt className="text-text-secondary">{n.label}</dt>
                  <dd className="font-medium text-text tabular-nums">
                    {formatAmount(value, n.unit)}
                    {goal ? <span className="text-text-tertiary"> / {formatAmount(goal, n.unit)}</span> : null}
                  </dd>
                </div>
                {goal ? (
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </dl>
      </Card>

      {mealGroups.length > 0 ? (
        mealGroups.map(([meal, entries]) => (
          <Card key={meal}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-semibold text-text">{meal}</p>
              <p className="text-xs text-text-tertiary tabular-nums">
                {entries.reduce((sum, e) => sum + e.kcal, 0).toLocaleString("pt-BR")} kcal
              </p>
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {entries.map((e) => (
                <FoodLogItem key={e.id} entry={e} />
              ))}
            </ul>
          </Card>
        ))
      ) : (
        <Card>
          <p className="py-4 text-center text-sm text-text-tertiary">
            Nada registrado nesse dia. Mande o que comeu ou bebeu para o bot no Telegram, em texto ou foto.
          </p>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-semibold text-text">Últimos {WEEK_DAYS} dias</p>
          {avgKcal !== null && avgProtein !== null && (
            <p className="text-xs text-text-tertiary tabular-nums">
              média {Math.round(avgKcal).toLocaleString("pt-BR")} kcal · {Math.round(avgProtein)} g prot.
            </p>
          )}
        </div>
        <BarChart bars={kcalBars} unit=" kcal" />
      </Card>
    </div>
  );
}
