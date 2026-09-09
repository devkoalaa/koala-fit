export type LoggedSet = { setNumber: number; reps: number; weightKg: number };

export type ExerciseSession = {
  routineExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseType: "weight" | "cardio";
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  loggedSets: LoggedSet[];
  lastPerformance: LoggedSet[];
  loggedCardio: { durationSeconds: number; distanceMeters: number | null; inclinePercent: number | null } | null;
  suggestProgression: boolean;
};
