import "server-only";
import type { cardioSessions, sets } from "@/db/schema";
import { getLastPerformance } from "@/lib/workout-data";
import type { ExerciseSession, LoggedCardio, LoggedSet } from "./types";

type SetRow = typeof sets.$inferSelect;
type CardioRow = typeof cardioSessions.$inferSelect;

export function mapLoggedSets(rows: SetRow[], exerciseId: string): LoggedSet[] {
  return rows
    .filter((s) => s.exerciseId === exerciseId)
    .map((s) => ({ setNumber: s.setNumber, reps: s.reps, weightKg: Number(s.weightKg) }));
}

export function mapLoggedCardio(rows: CardioRow[], exerciseId: string): LoggedCardio[] {
  return rows
    .filter((c) => c.exerciseId === exerciseId)
    .sort((a, b) => a.entryNumber - b.entryNumber)
    .map((c) => ({
      entryNumber: c.entryNumber,
      durationSeconds: c.durationSeconds,
      distanceMeters: c.distanceMeters ? Number(c.distanceMeters) : null,
      inclinePercent: c.inclinePercent ? Number(c.inclinePercent) : null,
    }));
}

/**
 * Exercício fora da rotina, adicionado durante o treino. Sem alvo de reps:
 * as séries partem da última vez que ele foi feito (ou 3 em branco).
 */
export async function buildExtraSession(
  userId: string,
  workoutId: string,
  exercise: { id: string; name: string; type: "weight" | "cardio" },
  setRows: SetRow[],
  cardioRows: CardioRow[],
): Promise<ExerciseSession> {
  const lastPerformance =
    exercise.type === "weight" ? await getLastPerformance(userId, exercise.id, workoutId) : [];

  return {
    routineExerciseId: `extra:${exercise.id}`,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    exerciseType: exercise.type,
    targetSets: exercise.type === "weight" ? lastPerformance.length || 3 : 1,
    targetRepsMin: null,
    targetRepsMax: null,
    targetDurationSeconds: null,
    targetDistanceMeters: null,
    notes: null,
    loggedSets: mapLoggedSets(setRows, exercise.id),
    lastPerformance,
    loggedCardio: mapLoggedCardio(cardioRows, exercise.id),
    suggestProgression: false,
    isExtra: true,
  };
}
