import { notFound, redirect } from "next/navigation";
import { and, eq, isNull, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { routines, routineExercises, exercises } from "@/db/schema";
import { EmptyState } from "@/design-system/components/EmptyState";
import { RoutineHeader } from "../RoutineHeader";
import { RoutineExerciseRow } from "../RoutineExerciseRow";
import { AddExerciseSheet } from "../AddExerciseSheet";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ routineId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { routineId } = await params;

  const [routine] = await db
    .select()
    .from(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, user.id)))
    .limit(1);
  if (!routine) notFound();

  const items = await db
    .select({
      id: routineExercises.id,
      targetSets: routineExercises.targetSets,
      targetRepsMin: routineExercises.targetRepsMin,
      targetRepsMax: routineExercises.targetRepsMax,
      targetDurationSeconds: routineExercises.targetDurationSeconds,
      notes: routineExercises.notes,
      exerciseName: exercises.name,
      exerciseType: exercises.type,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
    .where(eq(routineExercises.routineId, routineId))
    .orderBy(routineExercises.position);

  const catalog = await db
    .select({ id: exercises.id, name: exercises.name, muscleGroup: exercises.muscleGroup, type: exercises.type })
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, user.id)))
    .orderBy(exercises.name);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <RoutineHeader routineId={routine.id} initialName={routine.name} />

      {items.length === 0 ? (
        <EmptyState
          title="Sem exercícios ainda"
          description="Adicione exercícios para montar esta rotina."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <RoutineExerciseRow
              key={item.id}
              routineId={routine.id}
              item={{
                ...item,
                isFirst: index === 0,
                isLast: index === items.length - 1,
              }}
            />
          ))}
        </div>
      )}

      <AddExerciseSheet routineId={routine.id} options={catalog} />
    </div>
  );
}
