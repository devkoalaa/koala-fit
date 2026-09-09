"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { logSet, deleteSet } from "@/lib/actions/workout-sets";

type SetItem = { setNumber: number; reps: number; weightKg: number };

export function EditableExerciseGroup({
  workoutId,
  exerciseId,
  exerciseName,
  initialSets,
  recordBadge,
}: {
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  initialSets: SetItem[];
  recordBadge?: React.ReactNode;
}) {
  const [rows, setRows] = useState(initialSets);
  const [, startTransition] = useTransition();

  function updateRow(setNumber: number, patch: Partial<SetItem>) {
    setRows((prev) => {
      const next = prev.map((r) => (r.setNumber === setNumber ? { ...r, ...patch } : r));
      const updated = next.find((r) => r.setNumber === setNumber)!;
      startTransition(() =>
        logSet(workoutId, {
          exerciseId,
          setNumber,
          reps: updated.reps,
          weightKg: updated.weightKg,
        }),
      );
      return next;
    });
  }

  function removeRow(setNumber: number) {
    setRows((prev) => prev.filter((r) => r.setNumber !== setNumber));
    startTransition(() => deleteSet(workoutId, exerciseId, setNumber));
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const next: SetItem = {
      setNumber: rows.length + 1,
      reps: last?.reps ?? 10,
      weightKg: last?.weightKg ?? 0,
    };
    setRows((prev) => [...prev, next]);
    startTransition(() =>
      logSet(workoutId, { exerciseId, setNumber: next.setNumber, reps: next.reps, weightKg: next.weightKg }),
    );
  }

  if (rows.length === 0) return null;

  return (
    <Card className="flex flex-col gap-3">
      <p className="flex items-center font-semibold text-text">
        {exerciseName}
        {recordBadge}
      </p>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.setNumber} className="flex flex-col gap-2 rounded-md bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Série {row.setNumber}</span>
              <button
                type="button"
                onClick={() => removeRow(row.setNumber)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-danger"
                aria-label="Remover série"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberStepper
                label="Reps"
                value={row.reps}
                min={0}
                max={200}
                onChange={(v) => updateRow(row.setNumber, { reps: v })}
              />
              <NumberStepper
                label="Carga"
                value={row.weightKg}
                min={0}
                max={999}
                step={1.25}
                suffix="kg"
                onChange={(v) => updateRow(row.setNumber, { weightKg: v })}
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addRow} className="min-h-11 text-sm font-medium text-primary">
          + Série extra
        </button>
      </div>
    </Card>
  );
}
