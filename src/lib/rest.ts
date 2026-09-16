// Descanso entre séries: preferência do usuário (`users.rest_seconds`),
// editável em Perfil → Configurações e usada pelo timer da tela de treino.
export const REST_SECONDS_DEFAULT = 90;
export const REST_SECONDS_MIN = 15;
export const REST_SECONDS_MAX = 600;
export const REST_SECONDS_STEP = 15;

/** 45 → "45 s", 120 → "2 min", 90 → "1 min 30 s". */
export function formatRest(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
}
