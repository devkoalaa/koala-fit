import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { workouts, routines, routineExercises, exercises, sets, cardioSessions } from "@/db/schema";
import { getLastPerformance } from "@/lib/workout-data";
import { WorkoutSession } from "./WorkoutSession";
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
      const cardio = loggedCardio.find((c) => c.exerciseId === item.exerciseId);

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
        loggedSets: loggedSets
          .filter((s) => s.exerciseId === item.exerciseId)
          .map((s) => ({ setNumber: s.setNumber, reps: s.reps, weightKg: Number(s.weightKg) })),
        lastPerformance,
        loggedCardio: cardio
          ? {
              durationSeconds: cardio.durationSeconds,
              distanceMeters: cardio.distanceMeters ? Number(cardio.distanceMeters) : null,
              inclinePercent: cardio.inclinePercent ? Number(cardio.inclinePercent) : null,
            }
          : null,
      };
    }),
  );

  return (
    <WorkoutSession workoutId={workout.id} routineName={routine?.name ?? "Treino livre"} exercises={exerciseSessions} />
  );
}
