import { bodyCompositionLogs } from "@/db/schema";

type BodyCompositionRow = typeof bodyCompositionLogs.$inferSelect;

type NumericKey = {
  [K in keyof BodyCompositionRow]: BodyCompositionRow[K] extends string | number | null ? K : never;
}[keyof BodyCompositionRow];

export type BodyMetric = {
  id: string;
  label: string;
  unit: string;
  key: Exclude<NumericKey, "id" | "userId" | "date" | "source">;
  decimals: number;
};

// Metrics shown on /evolucao, in the order of the dropdown and summary grid.
export const BODY_METRICS: BodyMetric[] = [
  { id: "gordura", label: "Gordura corporal", unit: "%", key: "bodyFatPct", decimals: 1 },
  { id: "massa-gorda", label: "Massa de gordura", unit: "kg", key: "fatMassKg", decimals: 1 },
  { id: "musculo", label: "Massa muscular", unit: "kg", key: "muscleMassKg", decimals: 1 },
  { id: "esqueletico", label: "Músculo esquelético", unit: "kg", key: "skeletalMuscleKg", decimals: 1 },
  { id: "massa-magra", label: "Massa magra", unit: "kg", key: "leanMassKg", decimals: 1 },
  { id: "visceral", label: "Gordura visceral", unit: "", key: "visceralFat", decimals: 1 },
  { id: "agua", label: "Água", unit: "%", key: "waterPct", decimals: 1 },
  { id: "proteina", label: "Proteína", unit: "%", key: "proteinPct", decimals: 1 },
  { id: "imc", label: "IMC", unit: "", key: "bmi", decimals: 1 },
  { id: "tmb", label: "Metabolismo basal", unit: "kcal", key: "bmrKcal", decimals: 0 },
  { id: "idade-corporal", label: "Idade corporal", unit: "anos", key: "bodyAge", decimals: 0 },
];

export function findBodyMetric(id: string | undefined): BodyMetric {
  return BODY_METRICS.find((m) => m.id === id) ?? BODY_METRICS[0];
}

export function metricValue(row: BodyCompositionRow, metric: BodyMetric): number | null {
  const raw = row[metric.key];
  return raw === null ? null : Number(raw);
}

export function formatMetric(value: number, metric: BodyMetric): string {
  const text = value.toLocaleString("pt-BR", {
    minimumFractionDigits: metric.decimals,
    maximumFractionDigits: metric.decimals,
  });
  return metric.unit ? `${text} ${metric.unit}` : text;
}

/** Keeps only the last measurement of each day (rows must be sorted by measuredAt). */
export function lastPerDay(rows: BodyCompositionRow[]): BodyCompositionRow[] {
  const byDate = new Map<string, BodyCompositionRow>();
  for (const row of rows) byDate.set(row.date, row);
  return [...byDate.values()];
}
