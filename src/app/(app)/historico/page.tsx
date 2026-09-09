import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, gte, isNotNull } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, routines } from "@/db/schema";
import { toISODate, formatDateBR } from "@/lib/date";
import { isPeriod, periodStartDate, type Period } from "@/lib/period";
import { Card } from "@/design-system/components/Card";
import { EmptyState } from "@/design-system/components/EmptyState";
import { PeriodFilter } from "@/components/PeriodFilter";
import { FeelingIcon } from "@/components/FeelingIcon";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const period: Period = isPeriod(params.period) ? params.period : "all";
  const today = toISODate();
  const periodStart = periodStartDate(period, today);

  const items = await db
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
        eq(workouts.userId, user.id),
        isNotNull(workouts.durationMinutes),
        periodStart ? gte(workouts.date, periodStart) : undefined,
      ),
    )
    .orderBy(desc(workouts.date));

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-text">Histórico</h1>

      <PeriodFilter current={period} />

      {items.length === 0 ? (
        <EmptyState title="Nenhum treino no período" description="Os treinos concluídos aparecem aqui." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((w) => (
            <Link key={w.id} href={`/historico/${w.id}`}>
              <Card className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text">{w.routineName ?? "Treino livre"}</p>
                  <p className="text-sm text-text-secondary">
                    {formatDateBR(w.date)} · {w.durationMinutes} min
                  </p>
                </div>
                {w.feeling ? (
                  <FeelingIcon feeling={w.feeling} className="text-text-secondary" />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
