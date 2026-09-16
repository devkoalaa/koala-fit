"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { logCardio, deleteCardio } from "@/lib/actions/workout-sets";

export type CardioEntry = {
  entryNumber: number;
  durationMin: number;
  distanceKm: number;
  inclinePercent: number;
};

export function EditableCardioCard({
  workoutId,
  exerciseId,
  exerciseName,
  initialEntries,
}: {
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  initialEntries: CardioEntry[];
}) {
  const [rows, setRows] = useState(initialEntries);
  const [, startTransition] = useTransition();

  function save(entry: CardioEntry) {
    startTransition(() =>
      logCardio(workoutId, {
        exerciseId,
        entryNumber: entry.entryNumber,
        durationSeconds: Math.round(entry.durationMin * 60),
        distanceMeters: entry.distanceKm > 0 ? entry.distanceKm * 1000 : undefined,
        inclinePercent: entry.inclinePercent > 0 ? entry.inclinePercent : undefined,
      }),
    );
  }

  // Igual ao EditableExerciseGroup: a chamada ao server action fica fora do
  // updater do setState, que precisa ser puro.
  function updateRow(entryNumber: number, patch: Partial<CardioEntry>) {
    const current = rows.find((r) => r.entryNumber === entryNumber);
    if (!current) return;
    const updated = { ...current, ...patch };

    setRows((prev) => prev.map((r) => (r.entryNumber === entryNumber ? updated : r)));
    save(updated);
  }

  function removeRow(entryNumber: number) {
    setRows((prev) => prev.filter((r) => r.entryNumber !== entryNumber));
    startTransition(() => deleteCardio(workoutId, exerciseId, entryNumber));
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const next: CardioEntry = {
      entryNumber: Math.max(0, ...rows.map((r) => r.entryNumber)) + 1,
      durationMin: last?.durationMin ?? 10,
      distanceKm: 0,
      inclinePercent: last?.inclinePercent ?? 0,
    };
    setRows((prev) => [...prev, next]);
    save(next);
  }

  if (rows.length === 0) return null;

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-semibold text-text">{exerciseName}</p>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={row.entryNumber} className="flex flex-col gap-3 rounded-md bg-surface p-3">
            {rows.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text">Bloco {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRow(row.entryNumber)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-danger"
                  aria-label={`Remover bloco ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
            <NumberStepper
              label="Duração (min)"
              value={row.durationMin}
              min={1}
              max={180}
              onChange={(v) => updateRow(row.entryNumber, { durationMin: v })}
            />
            <NumberStepper
              label="Distância (km)"
              value={row.distanceKm}
              min={0}
              max={100}
              step={0.1}
              onChange={(v) => updateRow(row.entryNumber, { distanceKm: v })}
            />
            <NumberStepper
              label="Inclinação (%)"
              value={row.inclinePercent}
              min={0}
              max={20}
              step={0.5}
              onChange={(v) => updateRow(row.entryNumber, { inclinePercent: v })}
            />
          </div>
        ))}
        <button type="button" onClick={addRow} className="min-h-11 text-sm font-medium text-primary">
          + Bloco extra
        </button>
      </div>
    </Card>
  );
}
