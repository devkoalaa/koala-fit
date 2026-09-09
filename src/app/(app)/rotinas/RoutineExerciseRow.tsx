"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import {
  moveRoutineExercise,
  removeExerciseFromRoutine,
  updateRoutineExerciseTargets,
} from "./actions";

export type RoutineExerciseData = {
  id: string;
  exerciseName: string;
  exerciseType: "weight" | "cardio";
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetDurationSeconds: number | null;
  isFirst: boolean;
  isLast: boolean;
};

export function RoutineExerciseRow({
  routineId,
  item,
}: {
  routineId: string;
  item: RoutineExerciseData;
}) {
  const [pending, startTransition] = useTransition();

  function updateTargets(patch: Partial<RoutineExerciseData>) {
    const next = { ...item, ...patch };
    startTransition(() => {
      updateRoutineExerciseTargets(item.id, routineId, {
        targetSets: next.targetSets,
        targetRepsMin: next.targetRepsMin ?? undefined,
        targetRepsMax: next.targetRepsMax ?? undefined,
        targetDurationSeconds: next.targetDurationSeconds ?? undefined,
      });
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-text">{item.exerciseName}</p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={item.isFirst || pending}
            onClick={() => startTransition(() => moveRoutineExercise(routineId, item.id, "up"))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary disabled:opacity-30"
            aria-label="Mover para cima"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            disabled={item.isLast || pending}
            onClick={() => startTransition(() => moveRoutineExercise(routineId, item.id, "down"))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary disabled:opacity-30"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => removeExerciseFromRoutine(item.id, routineId))}
            className="flex h-8 w-8 items-center justify-center rounded-md text-danger disabled:opacity-30"
            aria-label="Remover exercício"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <NumberStepper
          label="Séries"
          value={item.targetSets}
          min={1}
          max={20}
          onChange={(v) => updateTargets({ targetSets: v })}
        />
        {item.exerciseType === "weight" ? (
          <>
            <NumberStepper
              label="Reps mín."
              value={item.targetRepsMin ?? 8}
              min={1}
              max={100}
              onChange={(v) => updateTargets({ targetRepsMin: v })}
            />
            <NumberStepper
              label="Reps máx."
              value={item.targetRepsMax ?? 12}
              min={1}
              max={100}
              onChange={(v) => updateTargets({ targetRepsMax: v })}
            />
          </>
        ) : (
          <NumberStepper
            label="Duração (min)"
            value={Math.round((item.targetDurationSeconds ?? 600) / 60)}
            min={1}
            max={180}
            onChange={(v) => updateTargets({ targetDurationSeconds: v * 60 })}
          />
        )}
      </div>
    </Card>
  );
}
