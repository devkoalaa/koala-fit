import { notFound, redirect } from "next/navigation";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, routines, routineExercises, exercises, sets, cardioSessions } from "@/db/schema";
import { getLastPerformance } from "@/lib/workout-data";
import { shouldSuggestProgression } from "@/lib/progression";
import { WorkoutSession } from "./WorkoutSession";
import { buildExtraSession, mapLoggedCardio, mapLoggedSets } from "./extra-exercise";
import type { ExerciseSession } from "./types";

export default async function TreinoPage({
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
  if (workout.durationMinutes != null) redirect(`/historico/${workoutId}`);

  const routine = workout.routineId
    ? (await db.select().from(routines).where(eq(routines.id, workout.routineId)).limit(1))[0]
    : undefined;

  const routineItems = workout.routineId
    ? await db
        .select({
          id: routineExercises.id,
          exerciseId: routineExercises.exerciseId,
          targetSets: routineExercises.targetSets,
          targetRepsMin: routineExercises.targetRepsMin,
          targetRepsMax: routineExercises.targetRepsMax,
          targetDurationSeconds: routineExercises.targetDurationSeconds,
          targetDistanceMeters: routineExercises.targetDistanceMeters,
          notes: routineExercises.notes,
          exerciseName: exercises.name,
          exerciseType: exercises.type,
        })
        .from(routineExercises)
        .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
        .where(eq(routineExercises.routineId, workout.routineId))
        .orderBy(routineExercises.position)
    : [];

  const loggedSets = await db.select().from(sets).where(eq(sets.workoutId, workoutId));
  const loggedCardio = await db.select().from(cardioSessions).where(eq(cardioSessions.workoutId, workoutId));

  const exerciseSessions: ExerciseSession[] = await Promise.all(
    routineItems.map(async (item) => {
      const lastPerformance =
        item.exerciseType === "weight" ? await getLastPerformance(user.id, item.exerciseId, workoutId) : [];
      const suggestProgression =
        item.exerciseType === "weight"
          ? await shouldSuggestProgression(
              user.id,
              item.exerciseId,
              item.targetRepsMax,
              item.targetSets,
              workoutId,
            )
          : false;

      return {
        routineExerciseId: item.id,
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName,
        exerciseType: item.exerciseType,
        targetSets: item.targetSets,
        targetRepsMin: item.targetRepsMin,
        targetRepsMax: item.targetRepsMax,
        targetDurationSeconds: item.targetDurationSeconds,
        targetDistanceMeters: item.targetDistanceMeters ? Number(item.targetDistanceMeters) : null,
        notes: item.notes,
        loggedSets: mapLoggedSets(loggedSets, item.exerciseId),
        lastPerformance,
        loggedCardio: mapLoggedCardio(loggedCardio, item.exerciseId),
        suggestProgression,
      };
    }),
  );

  // Exercícios fora da rotina que já têm algo registrado neste treino, na
  // ordem em que foram registrados.
  const routineExerciseIds = new Set(routineItems.map((i) => i.exerciseId));
  const extraIds = [
    ...new Set(
      [...loggedSets, ...loggedCardio]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((row) => row.exerciseId)
        .filter((id) => !routineExerciseIds.has(id)),
    ),
  ];
  const extraExercises =
    extraIds.length > 0
      ? await db
          .select({ id: exercises.id, name: exercises.name, type: exercises.type })
          .from(exercises)
          .where(inArray(exercises.id, extraIds))
      : [];
  const extraSessions = await Promise.all(
    extraIds
      .map((id) => extraExercises.find((e) => e.id === id))
      .filter((e) => e !== undefined)
      .map((e) => buildExtraSession(user.id, workoutId, e, loggedSets, loggedCardio)),
  );

  const catalog = await db
    .select({ id: exercises.id, name: exercises.name, type: exercises.type })
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, user.id)))
    .orderBy(exercises.name);

  return (
    <WorkoutSession
      workoutId={workout.id}
      routineName={routine?.name ?? "Treino livre"}
      exercises={[...exerciseSessions, ...extraSessions]}
      catalog={catalog}
      restSeconds={user.restSeconds}
    />
  );
}
