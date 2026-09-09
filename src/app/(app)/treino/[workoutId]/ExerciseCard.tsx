"use client";

import { useState, useTransition } from "react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { Button } from "@/design-system/components/Button";
import { cn } from "@/lib/cn";
import { logSet, logCardio } from "./actions";
import type { ExerciseSession } from "./types";

type SetRow = { setNumber: number; reps: number; weightKg: number; done: boolean };

function buildRows(item: ExerciseSession, count: number): SetRow[] {
  return Array.from({ length: count }, (_, i) => {
    const setNumber = i + 1;
    const logged = item.loggedSets.find((s) => s.setNumber === setNumber);
    const last = item.lastPerformance.find((s) => s.setNumber === setNumber);
    return {
      setNumber,
      reps: logged?.reps ?? last?.reps ?? item.targetRepsMin ?? 10,
      weightKg: logged?.weightKg ?? last?.weightKg ?? 0,
      done: Boolean(logged),
    };
  });
}

export function ExerciseCard({
  workoutId,
  item,
  expanded,
  onToggle,
  onSetLogged,
}: {
  workoutId: string;
  item: ExerciseSession;
  expanded: boolean;
  onToggle: () => void;
  onSetLogged: () => void;
}) {
  const initialCount = Math.max(item.targetSets, ...item.loggedSets.map((s) => s.setNumber));
  const [rows, setRows] = useState<SetRow[]>(() => buildRows(item, initialCount));
  const [pending, startTransition] = useTransition();

  const [cardioDuration, setCardioDuration] = useState(
    Math.round((item.loggedCardio?.durationSeconds ?? item.targetDurationSeconds ?? 600) / 60),
  );
  const [cardioDistance, setCardioDistance] = useState(
    item.loggedCardio?.distanceMeters != null
      ? item.loggedCardio.distanceMeters / 1000
      : (item.targetDistanceMeters ?? 0) / 1000,
  );
  const [cardioIncline, setCardioIncline] = useState(item.loggedCardio?.inclinePercent ?? 0);
  const [cardioDone, setCardioDone] = useState(Boolean(item.loggedCardio));

  const doneCount = rows.filter((r) => r.done).length;
  const target =
    item.exerciseType === "weight"
      ? `${item.targetSets}x${item.targetRepsMin ?? "?"}-${item.targetRepsMax ?? "?"}`
      : `${Math.round((item.targetDurationSeconds ?? 0) / 60)} min`;

  function updateRow(setNumber: number, patch: Partial<SetRow>) {
    setRows((prev) => prev.map((r) => (r.setNumber === setNumber ? { ...r, ...patch } : r)));
  }

  function completeSet(row: SetRow) {
    updateRow(row.setNumber, { done: true });
    startTransition(() =>
      logSet(workoutId, {
        exerciseId: item.exerciseId,
        setNumber: row.setNumber,
        reps: row.reps,
        weightKg: row.weightKg,
      }),
    );
    onSetLogged();
  }

  function addExtraSet() {
    setRows((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        reps: prev[prev.length - 1]?.reps ?? item.targetRepsMin ?? 10,
        weightKg: prev[prev.length - 1]?.weightKg ?? 0,
        done: false,
      },
    ]);
  }

  function completeCardio() {
    setCardioDone(true);
    startTransition(() =>
      logCardio(workoutId, {
        exerciseId: item.exerciseId,
        durationSeconds: Math.round(cardioDuration * 60),
        distanceMeters: cardioDistance > 0 ? cardioDistance * 1000 : undefined,
        inclinePercent: cardioIncline > 0 ? cardioIncline : undefined,
      }),
    );
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div>
          <p className="font-semibold text-text">{item.exerciseName}</p>
          <p className="text-sm text-text-secondary">{target}</p>
        </div>
        <div className="flex items-center gap-2">
          {item.exerciseType === "weight" ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                doneCount >= item.targetSets ? "bg-primary-soft text-primary" : "bg-surface text-text-secondary",
              )}
            >
              {doneCount}/{item.targetSets}
            </span>
          ) : (
            cardioDone && <span className="text-primary">✓</span>
          )}
          <span className="text-text-tertiary">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4">
          {item.exerciseType === "weight" ? (
            <>
              {rows.map((row) => {
                const last = item.lastPerformance.find((s) => s.setNumber === row.setNumber);
                return (
                  <div key={row.setNumber} className="flex flex-col gap-2 rounded-md bg-surface p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text">Série {row.setNumber}</span>
                      {last && (
                        <span className="text-xs text-text-tertiary">
                          Última vez: {last.reps}x{last.weightKg}kg
                        </span>
                      )}
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
                    <Button
                      size="md"
                      variant={row.done ? "secondary" : "primary"}
                      onClick={() => completeSet(row)}
                      disabled={pending}
                    >
                      {row.done ? "Série concluída ✓" : "Concluir série"}
                    </Button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addExtraSet}
                className="min-h-11 text-sm font-medium text-primary"
              >
                + Série extra
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 rounded-md bg-surface p-3">
              <NumberStepper
                label="Duração (min)"
                value={cardioDuration}
                min={1}
                max={180}
                onChange={setCardioDuration}
              />
              <NumberStepper
                label="Distância (km)"
                value={cardioDistance}
                min={0}
                max={100}
                step={0.1}
                onChange={setCardioDistance}
              />
              <NumberStepper
                label="Inclinação (%)"
                value={cardioIncline}
                min={0}
                max={20}
                step={0.5}
                onChange={setCardioIncline}
              />
              <Button variant={cardioDone ? "secondary" : "primary"} onClick={completeCardio} disabled={pending}>
                {cardioDone ? "Registrado ✓" : "Concluir"}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
