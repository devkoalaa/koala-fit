// Descanso entre séries: preferência do usuário (`users.rest_seconds`),
// editável tanto no Perfil quanto direto na tela de treino em andamento.
export const REST_SECONDS_DEFAULT = 90;
export const REST_SECONDS_MIN = 15;
export const REST_SECONDS_MAX = 600;
export const REST_SECONDS_STEP = 15;

/** 90 → "1:30", 45 → "0:45". */
export function formatRest(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.abs(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
