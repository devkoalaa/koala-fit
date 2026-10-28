import { bodyAssessments, bodyCompositionLogs } from "@/db/schema";

type AssessmentRow = typeof bodyAssessments.$inferSelect;
type ScaleRow = typeof bodyCompositionLogs.$inferSelect;

type NumericKey<Row> = {
  [K in keyof Row]: Row[K] extends string | number | null ? K : never;
}[keyof Row];

export type AssessmentMetric = {
  id: string;
  label: string;
  unit: string;
  decimals: number;
  key: Exclude<NumericKey<AssessmentRow>, "id" | "userId" | "date" | "evaluator" | "evaluatorRegistry" | "place" | "device" | "notes" | "nextAssessmentOn">;
  // Mesma grandeza na balança de casa, para comparar lado a lado.
  scaleKey?: Exclude<NumericKey<ScaleRow>, "id" | "userId" | "date" | "source">;
};

// Métricas que a balança também mede.
export const COMPARABLE_METRICS: AssessmentMetric[] = [
  { id: "peso", label: "Peso", unit: "kg", decimals: 1, key: "weightKg", scaleKey: "weightKg" },
  { id: "gordura", label: "Gordura corporal", unit: "%", decimals: 1, key: "bodyFatPct", scaleKey: "bodyFatPct" },
  { id: "massa-gorda", label: "Massa de gordura", unit: "kg", decimals: 1, key: "fatMassKg", scaleKey: "fatMassKg" },
  { id: "massa-magra", label: "Massa magra", unit: "kg", decimals: 1, key: "leanMassKg", scaleKey: "leanMassKg" },
  { id: "musculo", label: "Massa muscular", unit: "kg", decimals: 1, key: "muscleMassKg", scaleKey: "muscleMassKg" },
  { id: "esqueletico", label: "Músculo esquelético", unit: "kg", decimals: 1, key: "skeletalMuscleKg", scaleKey: "skeletalMuscleKg" },
  { id: "imc", label: "IMC", unit: "", decimals: 1, key: "bmi", scaleKey: "bmi" },
  { id: "tmb", label: "Metabolismo basal", unit: "kcal", decimals: 0, key: "bmrKcal", scaleKey: "bmrKcal" },
];

// Métricas que só a avaliação profissional tem.
export const ASSESSMENT_ONLY_METRICS: AssessmentMetric[] = [
  { id: "visceral", label: "Gordura visceral", unit: "cm²", decimals: 1, key: "visceralFatAreaCm2" },
  { id: "cintura", label: "Cintura", unit: "cm", decimals: 1, key: "waistCm" },
  { id: "rcq", label: "Cintura/quadril", unit: "", decimals: 2, key: "waistHipRatio" },
  { id: "agua-extra", label: "Água extracelular", unit: "", decimals: 3, key: "ecwRatio" },
  { id: "angulo-fase", label: "Ângulo de fase", unit: "°", decimals: 1, key: "phaseAngleDeg" },
  { id: "massa-celular", label: "Massa celular", unit: "kg", decimals: 1, key: "bodyCellMassKg" },
  { id: "agua", label: "Água corporal", unit: "L", decimals: 1, key: "bodyWaterL" },
  { id: "flexibilidade", label: "Flexibilidade (Wells)", unit: "cm", decimals: 0, key: "sitAndReachCm" },
  { id: "score", label: "Pontuação do aparelho", unit: "", decimals: 0, key: "score" },
];

function toNumber(raw: string | number | null | undefined): number | null {
  return raw === null || raw === undefined ? null : Number(raw);
}

export function assessmentValue(row: AssessmentRow, metric: AssessmentMetric): number | null {
  return toNumber(row[metric.key]);
}

export function scaleValue(row: ScaleRow, metric: AssessmentMetric): number | null {
  return metric.scaleKey ? toNumber(row[metric.scaleKey]) : null;
}

/** Faixa de referência do laudo, guardada em details.references pelo id da métrica. */
export function referenceFor(row: AssessmentRow, metric: AssessmentMetric): string | null {
  const refs = row.details?.references;
  if (!refs || typeof refs !== "object") return null;
  const ref = (refs as Record<string, unknown>)[metric.id];
  return typeof ref === "string" ? ref : null;
}

export function formatAssessmentMetric(value: number, metric: AssessmentMetric): string {
  const text = value.toLocaleString("pt-BR", {
    minimumFractionDigits: metric.decimals,
    maximumFractionDigits: metric.decimals,
  });
  if (metric.unit === "%" || metric.unit === "°") return `${text}${metric.unit}`;
  return metric.unit ? `${text} ${metric.unit}` : text;
}
