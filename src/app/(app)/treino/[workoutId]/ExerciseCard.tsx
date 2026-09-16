"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Check, ChevronDown, Trash2 } from "lucide-react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { Button } from "@/design-system/components/Button";
import { cn } from "@/lib/cn";
import { logSet, logCardio, deleteCardio } from "@/lib/actions/workout-sets";
import type { ExerciseSession } from "./types";

type SetRow = {
  setNumber: number;
  reps: number;
  weightKg: number;
  done: boolean;
};

type CardioRow = {
  entryNumber: number;
  durationMin: number;
  distanceKm: number;
  inclinePercent: number;
  done: boolean;
};

function defaultCardioRow(item: ExerciseSession, entryNumber: number): CardioRow {
  return {
    entryNumber,
    durationMin: Math.round((item.targetDurationSeconds ?? 600) / 60),
    distanceKm: (item.targetDistanceMeters ?? 0) / 1000,
    inclinePercent: 0,
    done: false,
  };
}

// Sem nada registrado, mostra um bloco em branco com o alvo da rotina; com
// blocos já registrados, mostra todos (e o "+ Bloco extra" adiciona mais).
function buildCardioRows(item: ExerciseSession): CardioRow[] {
  if (item.loggedCardio.length === 0) return [defaultCardioRow(item, 1)];

  return item.loggedCardio.map((c) => ({
    entryNumber: c.entryNumber,
    durationMin: Math.round(c.durationSeconds / 60),
    distanceKm: (c.distanceMeters ?? 0) / 1000,
    inclinePercent: c.inclinePercent ?? 0,
    done: true,
  }));
}

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
  const initialCount = Math.max(
    item.targetSets,
    ...item.loggedSets.map((s) => s.setNumber),
  );
  const [rows, setRows] = useState<SetRow[]>(() =>
    buildRows(item, initialCount),
  );
  const [pending, startTransition] = useTransition();

  const [cardioRows, setCardioRows] = useState<CardioRow[]>(() =>
    buildCardioRows(item),
  );

  const doneCount = rows.filter((r) => r.done).length;
  const cardioDoneCount = cardioRows.filter((r) => r.done).length;
  // Com blocos registrados o subtítulo vira o que foi feito ("5 + 15 min"),
  // não o alvo da rotina.
  const target =
    item.exerciseType === "weight"
      ? `${item.targetSets}x${item.targetRepsMin ?? "?"}-${item.targetRepsMax ?? "?"}`
      : cardioDoneCount > 0
        ? `${cardioRows
            .filter((r) => r.done)
            .map((r) => r.durationMin)
            .join(" + ")} min`
        : `${Math.round((item.targetDurationSeconds ?? 0) / 60)} min`;

  function updateRow(setNumber: number, patch: Partial<SetRow>) {
    setRows((prev) =>
      prev.map((r) => (r.setNumber === setNumber ? { ...r, ...patch } : r)),
    );
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

  function updateCardioRow(entryNumber: number, patch: Partial<CardioRow>) {
    setCardioRows((prev) =>
      prev.map((r) => (r.entryNumber === entryNumber ? { ...r, ...patch } : r)),
    );
  }

  function completeCardio(row: CardioRow) {
    updateCardioRow(row.entryNumber, { done: true });
    startTransition(() =>
      logCardio(workoutId, {
        exerciseId: item.exerciseId,
        entryNumber: row.entryNumber,
        durationSeconds: Math.round(row.durationMin * 60),
        distanceMeters: row.distanceKm > 0 ? row.distanceKm * 1000 : undefined,
        inclinePercent: row.inclinePercent > 0 ? row.inclinePercent : undefined,
      }),
    );
  }

  function addCardioEntry() {
    setCardioRows((prev) => {
      const nextNumber = Math.max(...prev.map((r) => r.entryNumber)) + 1;
      const last = prev[prev.length - 1];
      return [
        ...prev,
        { ...defaultCardioRow(item, nextNumber), inclinePercent: last?.inclinePercent ?? 0 },
      ];
    });
  }

  function removeCardioEntry(row: CardioRow) {
    setCardioRows((prev) => prev.filter((r) => r.entryNumber !== row.entryNumber));
    if (row.done) {
      startTransition(() => deleteCardio(workoutId, item.exerciseId, row.entryNumber));
    }
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
                doneCount >= item.targetSets
                  ? "bg-primary-soft text-primary"
                  : "bg-surface text-text-secondary",
              )}
            >
              {doneCount}/{item.targetSets}
            </span>
          ) : cardioDoneCount === cardioRows.length ? (
            <Check
              className="h-4 w-4 text-primary"
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            cardioRows.length > 1 && (
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-text-secondary">
                {cardioDoneCount}/{cardioRows.length}
              </span>
            )
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-tertiary transition-transform duration-200 ease-out",
              expanded && "rotate-180",
            )}
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-250 ease-out",
          expanded
            ? "grid-rows-[1fr] border-t border-border"
            : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 px-4 py-4">
            {item.suggestProgression && (
              <div className="flex items-start gap-2 rounded-md bg-accent-soft px-3 py-2 text-sm text-accent-fg">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Você bateu o topo da faixa nas últimas 2 sessões — que tal subir
                a carga hoje?
              </div>
            )}
            {item.exerciseType === "weight" ? (
              <>
                {rows.map((row) => {
                  const last = item.lastPerformance.find(
                    (s) => s.setNumber === row.setNumber,
                  );
                  return (
                    <div
                      key={row.setNumber}
                      className="flex flex-col gap-2 rounded-md bg-surface p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text">
                          Série {row.setNumber}
                        </span>
                        {last && (
                          <span className="text-xs text-text-tertiary">
                            Última vez: {last.reps}x{last.weightKg}kg
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <NumberStepper
                          label="Reps"
                          value={row.reps}
                          min={0}
                          max={200}
                          onChange={(v) =>
                            updateRow(row.setNumber, { reps: v })
                          }
                        />
                        <NumberStepper
                          label="Carga"
                          value={row.weightKg}
                          min={0}
                          max={999}
                          step={1.25}
                          suffix="kg"
                          onChange={(v) =>
                            updateRow(row.setNumber, { weightKg: v })
                          }
                        />
                      </div>
                      <Button
                        size="md"
                        variant={row.done ? "secondary" : "primary"}
                        onClick={() => completeSet(row)}
                        disabled={pending}
                      >
                        {row.done ? (
                          <>
                            Série concluída{" "}
                            <Check
                              className="h-4 w-4"
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          </>
                        ) : (
                          "Concluir série"
                        )}
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
              <>
                {cardioRows.map((row, index) => (
                  <div
                    key={row.entryNumber}
                    className="flex flex-col gap-3 rounded-md bg-surface p-3"
                  >
                    {cardioRows.length > 1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text">
                          Bloco {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCardioEntry(row)}
                          className="flex h-8 w-8 items-center justify-center text-text-tertiary"
                          aria-label={`Remover bloco ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                    <NumberStepper
                      label="Duração (min)"
                      value={row.durationMin}
                      min={1}
                      max={180}
                      onChange={(v) =>
                        updateCardioRow(row.entryNumber, { durationMin: v })
                      }
                    />
                    <NumberStepper
                      label="Distância (km)"
                      value={row.distanceKm}
                      min={0}
                      max={100}
                      step={0.1}
                      onChange={(v) =>
                        updateCardioRow(row.entryNumber, { distanceKm: v })
                      }
                    />
                    <NumberStepper
                      label="Inclinação (%)"
                      value={row.inclinePercent}
                      min={0}
                      max={20}
                      step={0.5}
                      onChange={(v) =>
                        updateCardioRow(row.entryNumber, { inclinePercent: v })
                      }
                    />
                    <Button
                      variant={row.done ? "secondary" : "primary"}
                      onClick={() => completeCardio(row)}
                      disabled={pending}
                    >
                      {row.done ? (
                        <>
                          Registrado{" "}
                          <Check
                            className="h-4 w-4"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        "Concluir"
                      )}
                    </Button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCardioEntry}
                  className="min-h-11 text-sm font-medium text-primary"
                >
                  + Bloco extra
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
