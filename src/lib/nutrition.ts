import { foodLogs, users } from "@/db/schema";

type FoodLogRow = typeof foodLogs.$inferSelect;
type UserRow = typeof users.$inferSelect;

export type NutrientKey = "kcal" | "protein" | "carbs" | "fat" | "fiber" | "water";

export type Nutrient = {
  key: NutrientKey;
  label: string;
  unit: string;
  goalKey: "kcalGoal" | "proteinGoalG" | "carbsGoalG" | "fatGoalG" | "fiberGoalG" | "waterGoalMl";
  // Passo e limites do ajuste de meta.
  step: number;
  max: number;
};

// Ordem das barras na aba Alimentação e dos campos de meta.
export const NUTRIENTS: Nutrient[] = [
  { key: "kcal", label: "Calorias", unit: "kcal", goalKey: "kcalGoal", step: 50, max: 6000 },
  { key: "protein", label: "Proteína", unit: "g", goalKey: "proteinGoalG", step: 5, max: 400 },
  { key: "carbs", label: "Carboidrato", unit: "g", goalKey: "carbsGoalG", step: 5, max: 800 },
  { key: "fat", label: "Gordura", unit: "g", goalKey: "fatGoalG", step: 5, max: 300 },
  { key: "fiber", label: "Fibra", unit: "g", goalKey: "fiberGoalG", step: 1, max: 100 },
  { key: "water", label: "Água", unit: "ml", goalKey: "waterGoalMl", step: 250, max: 8000 },
];

export type NutrientTotals = Record<NutrientKey, number>;

export function totalsOf(rows: FoodLogRow[]): NutrientTotals {
  const totals: NutrientTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 };
  for (const r of rows) {
    totals.kcal += r.kcal;
    totals.protein += Number(r.proteinG ?? 0);
    totals.carbs += Number(r.carbsG ?? 0);
    totals.fat += Number(r.fatG ?? 0);
    totals.fiber += Number(r.fiberG ?? 0);
    totals.water += r.waterMl ?? 0;
  }
  return totals;
}

export function goalOf(user: UserRow, nutrient: Nutrient): number | null {
  return user[nutrient.goalKey];
}

export function formatAmount(value: number, unit: string): string {
  if (unit === "ml" && value >= 1000) {
    return `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} L`;
  }
  return `${Math.round(value).toLocaleString("pt-BR")} ${unit}`;
}

export const MEAL_ORDER = ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Pré-treino", "Pós-treino", "Jantar", "Ceia"];
