"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Check, ChevronDown, Trash2, Info } from "lucide-react";
import { Sheet } from "@/design-system/components/Sheet";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { Button } from "@/design-system/components/Button";
import { cn } from "@/lib/cn";
import { getLoadHint } from "@/lib/load-hints";
import { getExerciseGuide, isBodyweightExercise } from "@/lib/exercise-guides";
import { logSet, logCardio, deleteCardio } from "@/lib/actions/workout-sets";
import type { ExerciseSession } from "./types";

type SetRow = {
  setNumber: number;
  reps: number;
  weightKg: number;
  done: boolean;
  // Valores que estão no banco; editar depois de concluir libera o "Salvar".
  saved: string | null;
};

function setSnapshot(row: Pick<SetRow, "reps" | "weightKg">): string {
  return `${row.reps}|${row.weightKg}`;
}

function cardioSnapshot(row: Pick<CardioRow, "durationMin" | "distanceKm" | "inclinePercent">): string {
  return `${row.durationMin}|${row.distanceKm}|${row.inclinePercent}`;
}

function isDirty(row: { done: boolean; saved: string | null }, snapshot: string): boolean {
  return row.done && row.saved !== snapshot;
}

type CardioRow = {
  entryNumber: number;
  durationMin: number;
  distanceKm: number;
  inclinePercent: number;
  done: boolean;
  saved: string | null;
};

function defaultCardioRow(item: ExerciseSession, entryNumber: number): CardioRow {
  return {
    entryNumber,
    durationMin: Math.round((item.targetDurationSeconds ?? 600) / 60),
    distanceKm: (item.targetDistanceMeters ?? 0) / 1000,
    inclinePercent: 0,
    done: false,
    saved: null,
  };
}

// Sem nada registrado, mostra um bloco em branco com o alvo da rotina; com
// blocos já registrados, mostra todos (e o "+ Bloco extra" adiciona mais).
function buildCardioRows(item: ExerciseSession): CardioRow[] {
  if (item.loggedCardio.length === 0) return [defaultCardioRow(item, item.entryOffset + 1)];

  return item.loggedCardio.map((c) => {
    const row = {
      entryNumber: c.entryNumber,
      durationMin: Math.round(c.durationSeconds / 60),
      distanceKm: (c.distanceMeters ?? 0) / 1000,
      inclinePercent: c.inclinePercent ?? 0,
    };
    return { ...row, done: true, saved: cardioSnapshot(row) };
  });
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
      saved: logged ? setSnapshot(logged) : null,
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
  const loadHint = item.exerciseType === "weight" ? getLoadHint(item.exerciseName) : null;
  const guide = getExerciseGuide(item.exerciseName);
  const [guideOpen, setGuideOpen] = useState(false);
  // Peso corporal começa sem o campo de carga; aparece se já houver carga
  // registrada (agora ou da última vez) ou se o usuário pedir.
  const bodyweight = item.exerciseType === "weight" && isBodyweightExercise(item.exerciseName);
  const [showLoad, setShowLoad] = useState(
    () =>
      !bodyweight ||
      item.loggedSets.some((s) => s.weightKg > 0) ||
      item.lastPerformance.some((s) => s.weightKg > 0),
  );

  const [cardioRows, setCardioRows] = useState<CardioRow[]>(() =>
    buildCardioRows(item),
  );

  const doneCount = rows.filter((r) => r.done).length;
  const cardioDoneCount = cardioRows.filter((r) => r.done).length;
  // Com blocos registrados o subtítulo vira o que foi feito ("5 + 15 min"),
  // não o alvo da rotina.
  const target =
    item.exerciseType === "weight"
      ? item.isExtra
        ? "Fora da rotina"
        : `${item.targetSets}x${item.targetRepsMin ?? "?"}-${item.targetRepsMax ?? "?"}`
      : cardioDoneCount > 0
        ? `${cardioRows
            .filter((r) => r.done)
            .map((r) => r.durationMin)
            .join(" + ")} min`
        : item.isExtra
          ? "Fora da rotina"
          : `${Math.round((item.targetDurationSeconds ?? 0) / 60)} min`;

  function updateRow(setNumber: number, patch: Partial<SetRow>) {
    setRows((prev) =>
      prev.map((r) => (r.setNumber === setNumber ? { ...r, ...patch } : r)),
    );
  }

  function completeSet(row: SetRow) {
    if (row.done && !isDirty(row, setSnapshot(row))) return;
    const isCorrection = row.done;
    updateRow(row.setNumber, { done: true, saved: setSnapshot(row) });
    startTransition(() =>
      logSet(workoutId, {
        exerciseId: item.exerciseId,
        setNumber: row.setNumber,
        reps: row.reps,
        weightKg: row.weightKg,
      }),
    );
    // Corrigir uma série já feita não reinicia o descanso.
    if (!isCorrection) onSetLogged();
  }

  function addExtraSet() {
    setRows((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        reps: prev[prev.length - 1]?.reps ?? item.targetRepsMin ?? 10,
        weightKg: prev[prev.length - 1]?.weightKg ?? 0,
        done: false,
        saved: null,
      },
    ]);
  }

  function updateCardioRow(entryNumber: number, patch: Partial<CardioRow>) {
    setCardioRows((prev) =>
      prev.map((r) => (r.entryNumber === entryNumber ? { ...r, ...patch } : r)),
    );
  }

  function completeCardio(row: CardioRow) {
    if (row.done && !isDirty(row, cardioSnapshot(row))) return;
    updateCardioRow(row.entryNumber, { done: true, saved: cardioSnapshot(row) });
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
      <div className="flex items-center">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="min-w-0 flex-1 py-3.5 pl-4 text-left"
      >
        <p className="font-semibold text-text">{item.exerciseName}</p>
        <p className="text-sm text-text-secondary">{target}</p>
      </button>
      {guide && (
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-text-tertiary"
          aria-label={`Como fazer ${item.exerciseName}`}
        >
          <Info className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-hidden="true"
        className="flex shrink-0 items-center gap-2 self-stretch pr-4 pl-2"
      >
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
      </button>
      </div>

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
              <div className="flex items-start gap-2 rounded-md bg-accent-soft px-3 py-2 text-sm text-text">
                <Lightbulb
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Na última sessão você fez {item.targetRepsMax} reps em todas as
                séries — {bodyweight && !showLoad ? `hora de dificultar o exercício${guide ? " (veja o ⓘ)" : ""}.` : "hora de subir a carga."}
              </div>
            )}
            {item.notes && (
              <p className="text-sm text-text-secondary">{item.notes}</p>
            )}
            {loadHint && (
              <div className="flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-sm text-text-secondary">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {loadHint}
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
                            Última vez:{" "}
                            {last.weightKg > 0 ? `${last.reps}x${last.weightKg}kg` : `${last.reps} reps`}
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
                        {showLoad && (
                        <NumberStepper
                          label="Carga"
                          value={row.weightKg}
                          min={0}
                          max={999}
                          step={1}
                          suffix="kg"
                          onChange={(v) =>
                            updateRow(row.setNumber, { weightKg: v })
                          }
                        />
                        )}
                      </div>
                      <Button
                        size="md"
                        variant={row.done && !isDirty(row, setSnapshot(row)) ? "secondary" : "primary"}
                        onClick={() => completeSet(row)}
                        disabled={pending}
                      >
                        {isDirty(row, setSnapshot(row)) ? (
                          "Salvar alteração"
                        ) : row.done ? (
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
                {!showLoad && (
                  <button
                    type="button"
                    onClick={() => setShowLoad(true)}
                    className="-mt-2 min-h-11 text-sm text-text-secondary"
                  >
                    + Usar carga (caneleira, anilha)
                  </button>
                )}
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
                      variant={row.done && !isDirty(row, cardioSnapshot(row)) ? "secondary" : "primary"}
                      onClick={() => completeCardio(row)}
                      disabled={pending}
                    >
                      {isDirty(row, cardioSnapshot(row)) ? (
                        "Salvar alteração"
                      ) : row.done ? (
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
      {guide && (
        <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title={item.exerciseName}>
          <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pb-2">
            <p className="text-sm text-text-secondary">{guide.summary}</p>
            {guide.sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-text">{section.title}</p>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-text-secondary">
                  {section.items.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </Card>
  );
}
