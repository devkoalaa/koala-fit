import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../client";
import { exercises } from "../schema";
import { catalogRenames, exerciseCatalog } from "./exercises";

/**
 * Deixa o catálogo global igual a `exerciseCatalog`: primeiro renomeia as
 * linhas com nome antigo (mesmo id, então as séries registradas seguem
 * ligadas a elas), depois insere o que faltar. Idempotente.
 */
export async function syncCatalog() {
  let renamed = 0;
  for (const { from, to } of catalogRenames) {
    const [target] = await db
      .select({ id: exercises.id })
      .from(exercises)
      .where(and(isNull(exercises.userId), eq(exercises.name, to)))
      .limit(1);
    if (target) continue;

    const rows = await db
      .update(exercises)
      .set({ name: to })
      .where(and(isNull(exercises.userId), eq(exercises.name, from)))
      .returning({ id: exercises.id });
    if (rows.length > 0) {
      renamed += rows.length;
      console.log(`Renomeado: "${from}" -> "${to}"`);
    }
  }

  const inserted = await db
    .insert(exercises)
    .values(exerciseCatalog)
    .onConflictDoNothing({
      target: exercises.name,
      where: sql`${exercises.userId} is null`,
    })
    .returning({ name: exercises.name });

  console.log(`Catálogo: ${renamed} renomeados, ${inserted.length} novos.`);
}
