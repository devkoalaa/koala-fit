// Cria as rotinas Treino A e Treino B do plano atual e ajusta a meta semanal.
// Não toca em treinos, séries ou cardio já registrados.
//
// Usage:
//   pnpm seed:plano                         (único usuário do banco)
//   pnpm seed:plano -- --email voce@example.com
//   pnpm seed:plano -- --replace            (reescreve os exercícios de um
//                                            Treino A/B que já exista)
//
// Idempotente: rodar de novo não duplica nada.

import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../client";
import { exercises, routineExercises, routines, users } from "../schema";
import { syncCatalog } from "./catalog";

type PlanItem = {
  exercise: string;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  durationMin?: number;
  notes?: string;
};

// Cardio no fim das duas: esteira, 15–20 min. O alvo guarda o piso (15 min)
// e a faixa completa vai na observação.
const treadmill: PlanItem = { exercise: "Esteira", sets: 1, durationMin: 15, notes: "15–20 min" };

// Na ordem de criação: a tela Hoje alterna as rotinas nessa ordem.
const plan: { name: string; items: PlanItem[] }[] = [
  {
    name: "Treino A",
    items: [
      { exercise: "Leg press 45", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Mesa flexora", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Supino reto com barra", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Puxada alta", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Remada máquina", sets: 2, repsMin: 10, repsMax: 15 },
      { exercise: "Elevação lateral (halteres)", sets: 2, repsMin: 12, repsMax: 15 },
      { exercise: "Paralela abdominal", sets: 3, repsMin: 8, repsMax: 12, notes: "Joelhos dobrados" },
      treadmill,
    ],
  },
  {
    name: "Treino B",
    items: [
      { exercise: "Leg press horizontal", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Glúteo máquina", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Cadeira abdutora", sets: 2, repsMin: 12, repsMax: 15 },
      { exercise: "Supino inclinado (halteres)", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Remada baixa", sets: 3, repsMin: 10, repsMax: 15 },
      { exercise: "Crucifixo", sets: 2, repsMin: 12, repsMax: 15 },
      { exercise: "Bíceps scott", sets: 2, repsMin: 10, repsMax: 15 },
      { exercise: "Tríceps na puxada alta (corda)", sets: 2, repsMin: 10, repsMax: 15 },
      treadmill,
    ],
  },
];

// 2–3x por semana, alternando A e B. A meta é um número inteiro, então fica o
// piso da faixa: 2 treinos batem a meta, o terceiro é bônus.
const WEEKLY_GOAL = 2;

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function resolveUser() {
  const email = getArg("--email");
  if (email) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new Error(`Nenhum usuário com o email ${email}.`);
    return user;
  }

  const all = await db.select().from(users).limit(2);
  if (all.length === 0) throw new Error("Nenhum usuário no banco — rode `pnpm seed:user` antes.");
  if (all.length > 1) throw new Error("Há mais de um usuário — passe --email.");
  return all[0];
}

async function main() {
  const replace = process.argv.includes("--replace");

  await syncCatalog();

  const names = [...new Set(plan.flatMap((r) => r.items.map((i) => i.exercise)))];
  const catalogRows = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .where(and(isNull(exercises.userId), inArray(exercises.name, names)));
  const exerciseIds = new Map(catalogRows.map((r) => [r.name, r.id]));
  const missing = names.filter((n) => !exerciseIds.has(n));
  if (missing.length > 0) throw new Error(`Faltam no catálogo: ${missing.join(", ")}`);

  const user = await resolveUser();

  for (const routine of plan) {
    let [existing] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(and(eq(routines.userId, user.id), eq(routines.name, routine.name)))
      .limit(1);

    if (existing) {
      const current = await db
        .select({ id: routineExercises.id })
        .from(routineExercises)
        .where(eq(routineExercises.routineId, existing.id));
      if (current.length > 0 && !replace) {
        console.log(`"${routine.name}" já existe com exercícios — mantida (use --replace para reescrever).`);
        continue;
      }
      // Só a lista de exercícios da rotina é reescrita; a rotina mantém o id,
      // então os treinos antigos continuam apontando para ela.
      await db.delete(routineExercises).where(eq(routineExercises.routineId, existing.id));
      await db.update(routines).set({ updatedAt: new Date() }).where(eq(routines.id, existing.id));
    } else {
      [existing] = await db
        .insert(routines)
        .values({ userId: user.id, name: routine.name })
        .returning({ id: routines.id });
    }

    await db.insert(routineExercises).values(
      routine.items.map((item, index) => ({
        routineId: existing.id,
        exerciseId: exerciseIds.get(item.exercise)!,
        position: index + 1,
        targetSets: item.sets,
        targetRepsMin: item.repsMin ?? null,
        targetRepsMax: item.repsMax ?? null,
        targetDurationSeconds: item.durationMin ? item.durationMin * 60 : null,
        notes: item.notes ?? null,
      })),
    );
    console.log(`"${routine.name}": ${routine.items.length} exercícios.`);
  }

  await db.update(users).set({ weeklyGoal: WEEKLY_GOAL, updatedAt: new Date() }).where(eq(users.id, user.id));
  console.log(`Meta semanal: ${WEEKLY_GOAL}x (plano de 2–3x por semana).`);
}

main()
  .then(() => {
    console.log("Plano pronto.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha ao criar o plano:", error);
    process.exit(1);
  });
