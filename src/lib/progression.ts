import type { LastSetPerformance } from "@/lib/workout-data";

/**
 * Dupla progressão: sobe a carga quando a última sessão do exercício fechou
 * todas as séries-alvo no topo da faixa de repetições (ex.: 3x15 numa faixa
 * de 10–15). Séries extras além do alvo não contam.
 */
export function shouldSuggestProgression(
  lastPerformance: LastSetPerformance[],
  targetRepsMax: number | null,
  targetSets: number,
): boolean {
  if (!targetRepsMax || targetSets < 1) return false;

  const targetRows = lastPerformance.filter((s) => s.setNumber <= targetSets);
  if (targetRows.length < targetSets) return false;

  return targetRows.every((s) => s.reps >= targetRepsMax);
}
