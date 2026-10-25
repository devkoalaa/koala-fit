// Duração do treino: do início até o último registro (série ou cardio), e não
// até a hora em que o botão "Finalizar" foi apertado — é comum esquecer de
// finalizar e só fechar o treino horas depois.

/**
 * Pausa maior que isso entre dois registros = o treino já tinha acabado (ex.:
 * série adicionada à noite). É folgada porque às vezes as séries são todas
 * lançadas no fim do treino.
 */
export const WORKOUT_GAP_MINUTES = 180;
/** "Finalizar" até esse tempo depois do último registro conta como fim real. */
export const FINISH_TOLERANCE_MINUTES = 60;
/** Folga depois do último registro (descanso/última série). */
const TAIL_MINUTES = 2;

/**
 * Minutos entre `startedAt` e o fim real do treino.
 * - Registros depois de uma pausa > 3 h são ignorados.
 * - Se `finishedAt` veio até 60 min depois do último registro, vale `finishedAt`
 *   (o usuário finalizou na hora, alongamento etc. conta).
 * - Sem registros, cai para `finishedAt - startedAt`.
 */
export function computeWorkoutDurationMinutes(
  startedAt: Date,
  activity: Date[],
  finishedAt: Date,
): number {
  const gapMs = WORKOUT_GAP_MINUTES * 60_000;
  const toleranceMs = FINISH_TOLERANCE_MINUTES * 60_000;
  const times = activity
    .map((d) => d.getTime())
    .filter((t) => t >= startedAt.getTime())
    .sort((a, b) => a - b);

  let lastActivity = startedAt.getTime();
  for (const t of times) {
    if (t - lastActivity > gapMs) break;
    lastActivity = t;
  }

  const end =
    times.length === 0 || finishedAt.getTime() - lastActivity <= toleranceMs
      ? finishedAt.getTime()
      : lastActivity + TAIL_MINUTES * 60_000;

  return Math.max(1, Math.round((end - startedAt.getTime()) / 60_000));
}
