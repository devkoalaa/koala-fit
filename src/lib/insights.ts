export type TodayContext = {
  hasTrainedToday: boolean;
  weeklyDoneCount: number;
  weeklyGoal: number;
  currentStreak: number;
  daysSinceLastWorkout: number | null;
  newRecordsCount?: number;
  trend?: { exerciseName: string; deltaKg: number; weeks: number } | null;
};

/**
 * Contextual, data-driven copy for the Hoje screen — never a static generic
 * string. Encouraging tone: invites, never scolds a missed day.
 */
export function buildTodayMessage(ctx: TodayContext): string {
  if (ctx.hasTrainedToday) {
    if (ctx.newRecordsCount && ctx.newRecordsCount > 0) {
      const s = ctx.newRecordsCount > 1 ? "s" : "";
      return `Treino registrado — e você bateu ${ctx.newRecordsCount} recorde${s} pessoal${s} hoje!`;
    }
    if (ctx.weeklyGoal > 0 && ctx.weeklyDoneCount >= ctx.weeklyGoal) {
      return `${ctx.weeklyDoneCount}º treino da semana — meta batida!`;
    }
    return `Treino registrado. Já são ${ctx.weeklyDoneCount} essa semana.`;
  }

  if (ctx.daysSinceLastWorkout === null) {
    return "Pronto para o primeiro treino?";
  }
  if (ctx.daysSinceLastWorkout >= 3) {
    return `Faz ${ctx.daysSinceLastWorkout} dias desde o último treino. Que tal hoje?`;
  }
  if (ctx.trend) {
    return `${ctx.trend.exerciseName} subiu ${ctx.trend.deltaKg}kg nas últimas ${ctx.trend.weeks} semanas. Bora continuar?`;
  }
  if (ctx.currentStreak > 0) {
    return `Sua ofensiva está em ${ctx.currentStreak}. Vamos manter?`;
  }
  return "Bora treinar hoje?";
}
