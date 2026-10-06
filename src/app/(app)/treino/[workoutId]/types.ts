export type LoggedSet = { setNumber: number; reps: number; weightKg: number };

// Um treino pode ter vários blocos do mesmo cardio (aquecimento + final);
// `entryNumber` é o que os separa dentro do par (treino, exercício).
export type LoggedCardio = {
  entryNumber: number;
  durationSeconds: number;
  distanceMeters: number | null;
  inclinePercent: number | null;
};

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
  notes: string | null;
  loggedSets: LoggedSet[];
  lastPerformance: LoggedSet[];
  loggedCardio: LoggedCardio[];
  suggestProgression: boolean;
  // Adicionado durante o treino, fora da rotina.
  isExtra?: boolean;
};
