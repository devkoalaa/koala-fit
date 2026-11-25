import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { bodyWeightLogs, doseLogs } from "@/db/schema";
import { Card } from "@/design-system/components/Card";
import { APP_TIMEZONE, addDays, diffDays, formatDateBR, toISODate } from "@/lib/date";
import { DoseItem, type DoseEntry } from "./DoseItem";
import { NewDoseSheet } from "./NewDoseSheet";

// Tela sem link: só abre por 5 toques no título da Evolução (SecretTitle).
export const metadata = { title: "Registro" };

const DOSE_INTERVAL_DAYS = 7;

const whenFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function kg(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const doses = await db
    .select()
    .from(doseLogs)
    .where(eq(doseLogs.userId, user.id))
    .orderBy(desc(doseLogs.takenAt));

  const today = toISODate();
  const last = doses[0];
  const first = doses.at(-1);

  // Semanas seguidas na dose atual.
  const currentDose = last ? Number(last.doseMg) : null;
  const weeksOnDose = currentDose === null ? 0 : doses.findIndex((d) => Number(d.doseMg) !== currentDose) === -1
    ? doses.length
    : doses.findIndex((d) => Number(d.doseMg) !== currentDose);

  const nextDate = last ? addDays(last.date, DOSE_INTERVAL_DAYS) : null;
  const daysToNext = nextDate ? diffDays(today, nextDate) : null;
  const nextLabel =
    daysToNext === null
      ? null
      : daysToNext > 1
        ? `em ${daysToNext} dias (${formatDateBR(nextDate!).slice(0, 5)})`
        : daysToNext === 1
          ? "amanhã"
          : daysToNext === 0
            ? "hoje"
            : `atrasada ${-daysToNext} ${-daysToNext === 1 ? "dia" : "dias"}`;

  // Peso de partida: última pesagem até o dia da primeira aplicação (ou a
  // primeira depois, se não houver nenhuma antes).
  let startWeight: { date: string; weightKg: string } | undefined;
  let latestWeight: { date: string; weightKg: string } | undefined;
  if (first) {
    [startWeight] = await db
      .select({ date: bodyWeightLogs.date, weightKg: bodyWeightLogs.weightKg })
      .from(bodyWeightLogs)
      .where(and(eq(bodyWeightLogs.userId, user.id), lte(bodyWeightLogs.date, first.date)))
      .orderBy(desc(bodyWeightLogs.date))
      .limit(1);
    startWeight ??= (
      await db
        .select({ date: bodyWeightLogs.date, weightKg: bodyWeightLogs.weightKg })
        .from(bodyWeightLogs)
        .where(eq(bodyWeightLogs.userId, user.id))
        .orderBy(asc(bodyWeightLogs.date))
        .limit(1)
    )[0];
    [latestWeight] = await db
      .select({ date: bodyWeightLogs.date, weightKg: bodyWeightLogs.weightKg })
      .from(bodyWeightLogs)
      .where(eq(bodyWeightLogs.userId, user.id))
      .orderBy(desc(bodyWeightLogs.date))
      .limit(1);
  }
  const change =
    startWeight && latestWeight && latestWeight.date > startWeight.date
      ? Number(latestWeight.weightKg) - Number(startWeight.weightKg)
      : null;

  const entries: DoseEntry[] = doses.map((d) => ({
    id: d.id,
    when: whenFormatter.format(d.takenAt),
    doseMg: Number(d.doseMg),
    notes: d.notes,
  }));

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-4">
      <div className="flex items-center gap-2">
        <Link
          href="/evolucao"
          aria-label="Voltar"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-md text-text-secondary active:bg-surface"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-text">Doses</h1>
      </div>

      <NewDoseSheet defaultDoseMg={currentDose ?? 2.5} />

      {last ? (
        <>
          <Card>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-text-secondary">Dose atual</dt>
                <dd className="text-lg font-semibold text-text tabular-nums">
                  {currentDose!.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mg
                </dd>
                <dd className="text-xs text-text-tertiary">
                  {weeksOnDose} {weeksOnDose === 1 ? "semana" : "semanas"} nessa dose
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Próxima</dt>
                <dd className={`text-lg font-semibold tabular-nums ${daysToNext! < 0 ? "text-danger" : "text-text"}`}>
                  {nextLabel}
                </dd>
                <dd className="text-xs text-text-tertiary">{doses.length} doses no total</dd>
              </div>
              {startWeight && (
                <div className="col-span-2 border-t border-border pt-3">
                  <dt className="text-text-secondary">Peso desde o início</dt>
                  <dd className="text-text tabular-nums">
                    {kg(Number(startWeight.weightKg))} ({formatDateBR(startWeight.date).slice(0, 5)})
                    {latestWeight && change !== null && (
                      <>
                        {" → "}
                        {kg(Number(latestWeight.weightKg))} ({formatDateBR(latestWeight.date).slice(0, 5)}){" "}
                        <span className={`font-semibold ${change <= 0 ? "text-primary" : "text-danger"}`}>
                          {change > 0 ? "+" : ""}
                          {kg(change)}
                        </span>
                      </>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <p className="mb-1 font-semibold text-text">Histórico</p>
            <ul className="flex flex-col divide-y divide-border">
              {entries.map((d) => (
                <DoseItem key={d.id} dose={d} />
              ))}
            </ul>
          </Card>
        </>
      ) : (
        <Card>
          <p className="py-4 text-center text-sm text-text-tertiary">Nenhuma dose registrada.</p>
        </Card>
      )}
    </div>
  );
}
