import { notFound, redirect } from "next/navigation";
import { and, eq, isNull, or } from "drizzle-orm";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, routines, sets, cardioSessions, exercises } from "@/db/schema";
import { formatDateBR } from "@/lib/date";
import { getAllTimePersonalRecords } from "@/lib/personal-records";
import { EmptyState } from "@/design-system/components/EmptyState";
import { EditableExerciseGroup } from "./EditableExerciseGroup";
import { EditableCardioCard } from "./EditableCardioCard";
import { EditableFeeling } from "./EditableFeeling";
import { AddExerciseToWorkoutSheet } from "./AddExerciseToWorkoutSheet";
import { DeleteWorkoutButton } from "./DeleteWorkoutButton";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { workoutId } = await params;

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
    .limit(1);
  if (!workout) notFound();
  if (workout.durationMinutes == null) redirect(`/treino/${workoutId}`);

  const routine = workout.routineId
    ? (await db.select().from(routines).where(eq(routines.id, workout.routineId)).limit(1))[0]
    : undefined;

  const loggedSets = await db
    .select({
      exerciseId: sets.exerciseId,
      exerciseName: exercises.name,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .where(eq(sets.workoutId, workoutId))
    .orderBy(exercises.name, sets.setNumber);

  const cardio = await db
    .select({
      exerciseId: cardioSessions.exerciseId,
      exerciseName: exercises.name,
      durationSeconds: cardioSessions.durationSeconds,
      distanceMeters: cardioSessions.distanceMeters,
      inclinePercent: cardioSessions.inclinePercent,
    })
    .from(cardioSessions)
    .innerJoin(exercises, eq(cardioSessions.exerciseId, exercises.id))
    .where(eq(cardioSessions.workoutId, workoutId));

  const allTimeRecords = await getAllTimePersonalRecords(user.id);
  const recordsToday = new Set(
    allTimeRecords.filter((r) => r.date === workout.date).map((r) => `${r.exerciseId}:${r.metric}`),
  );

  const exerciseGroups = Object.values(
    loggedSets.reduce<Record<string, { exerciseId: string; exerciseName: string; sets: typeof loggedSets }>>(
      (acc, s) => {
        acc[s.exerciseId] ??= { exerciseId: s.exerciseId, exerciseName: s.exerciseName, sets: [] };
        acc[s.exerciseId].sets.push(s);
        return acc;
      },
      {},
    ),
  );

  const totalVolume = loggedSets.reduce((sum, s) => sum + Number(s.weightKg) * s.reps, 0);

  const catalog = await db
    .select({ id: exercises.id, name: exercises.name, type: exercises.type })
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, user.id)))
    .orderBy(exercises.name);

  const existingExerciseIds = [
    ...exerciseGroups.map((g) => g.exerciseId),
    ...cardio.map((c) => c.exerciseId),
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">{formatDateBR(workout.date)}</p>
          <h1 className="text-2xl font-bold text-text">{routine?.name ?? "Treino livre"}</h1>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {workout.durationMinutes} min · {Math.round(totalVolume)} kg de volume
            </p>
            <EditableFeeling workoutId={workoutId} initialFeeling={workout.feeling} />
          </div>
        </div>
        <DeleteWorkoutButton workoutId={workoutId} />
      </div>

      <div className="flex flex-col gap-3">
        {exerciseGroups.length === 0 && cardio.length === 0 && (
          <EmptyState
            title="Nenhuma série registrada"
            description="Esse treino foi concluído sem exercícios registrados."
          />
        )}

        {exerciseGroups.map((group) => (
          <EditableExerciseGroup
            key={group.exerciseId}
            workoutId={workoutId}
            exerciseId={group.exerciseId}
            exerciseName={group.exerciseName}
            initialSets={group.sets.map((s) => ({
              setNumber: s.setNumber,
              reps: s.reps,
              weightKg: Number(s.weightKg),
            }))}
            recordBadge={
              recordsToday.has(`${group.exerciseId}:max_weight`) ? (
                <span className="ml-2 inline-flex items-center gap-1 text-sm text-accent">
                  <Trophy className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  recorde
                </span>
              ) : undefined
            }
          />
        ))}

        {cardio.map((c) => (
          <EditableCardioCard
            key={c.exerciseId}
            workoutId={workoutId}
            exerciseId={c.exerciseId}
            exerciseName={c.exerciseName}
            initialDurationSeconds={c.durationSeconds}
            initialDistanceMeters={c.distanceMeters ? Number(c.distanceMeters) : null}
            initialInclinePercent={c.inclinePercent ? Number(c.inclinePercent) : null}
          />
        ))}

        <AddExerciseToWorkoutSheet
          workoutId={workoutId}
          options={catalog}
          existingExerciseIds={existingExerciseIds}
        />
      </div>
    </div>
  );
}
