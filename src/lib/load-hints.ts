/**
 * Dica de como anotar a carga, deduzida do nome do exercício — o catálogo não
 * guarda o equipamento. Null quando não há nada específico a dizer.
 */
export function getLoadHint(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase();

  if (name.includes("halter")) {
    return "Registre o peso de cada halter, não a soma dos dois.";
  }
  if (name.includes("supino") && name.includes("barra")) {
    return "Registre barra + anilhas — a barra pesa 20 kg.";
  }
  return null;
}
