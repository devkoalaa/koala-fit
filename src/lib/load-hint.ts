// Dica de como anotar a carga, a partir do nome do exercício. Sem campo no
// banco: o catálogo já diz "(halteres)" / "com barra" no nome.
export function getLoadHint(exerciseName: string): string | null {
  const name = exerciseName.toLocaleLowerCase("pt-BR");
  if (name.includes("halter")) return "Registre o peso de cada halter.";
  if (name.includes("supino") && name.includes("barra")) {
    return "Registre barra + anilhas (a barra pesa 20 kg).";
  }
  return null;
}
