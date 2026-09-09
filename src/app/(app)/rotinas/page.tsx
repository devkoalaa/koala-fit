import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { routines, routineExercises } from "@/db/schema";
import { Card } from "@/design-system/components/Card";
import { EmptyState } from "@/design-system/components/EmptyState";
import { NewRoutineSheet } from "./NewRoutineSheet";

export default async function RotinasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await db
    .select({
      id: routines.id,
      name: routines.name,
      exerciseCount: sql<number>`count(${routineExercises.id})`,
    })
    .from(routines)
    .leftJoin(routineExercises, eq(routineExercises.routineId, routines.id))
    .where(eq(routines.userId, user.id))
    .groupBy(routines.id)
    .orderBy(routines.createdAt);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-text">Rotinas</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma rotina ainda"
          description="Crie sua primeira rotina de treino para começar."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((r) => (
            <Link key={r.id} href={`/rotinas/${r.id}`}>
              <Card className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text">{r.name}</p>
                  <p className="text-sm text-text-secondary">
                    {r.exerciseCount} exercício{Number(r.exerciseCount) === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-text-tertiary" aria-hidden="true">
                  ›
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NewRoutineSheet />
    </div>
  );
}
