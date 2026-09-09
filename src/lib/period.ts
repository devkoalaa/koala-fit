import { addDays } from "@/lib/date";

export type Period = "4w" | "12w" | "all";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "4w", label: "4 semanas" },
  { value: "12w", label: "12 semanas" },
  { value: "all", label: "Tudo" },
];

export function isPeriod(value: string | undefined): value is Period {
  return value === "4w" || value === "12w" || value === "all";
}

/** Inclusive start date for the period, or null for "all". */
export function periodStartDate(period: Period, today: string): string | null {
  if (period === "all") return null;
  const weeks = period === "4w" ? 4 : 12;
  return addDays(today, -weeks * 7);
}
