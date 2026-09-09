"use client";

import { useMemo, useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { logSet, logCardio } from "@/lib/actions/workout-sets";

type ExerciseOption = { id: string; name: string; type: "weight" | "cardio" };

export function AddExerciseToWorkoutSheet({
  workoutId,
  options,
  existingExerciseIds,
}: {
  workoutId: string;
  options: ExerciseOption[];
  existingExerciseIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const existing = new Set(existingExerciseIds);
    const q = query.trim().toLowerCase();
    const base = options.filter((o) => !existing.has(o.id));
    return q ? base.filter((o) => o.name.toLowerCase().includes(q)) : base;
  }, [query, options, existingExerciseIds]);

  function handleAdd(option: ExerciseOption) {
    setAddingId(option.id);
    startTransition(async () => {
      if (option.type === "cardio") {
        await logCardio(workoutId, { exerciseId: option.id, durationSeconds: 600 });
      } else {
        await logSet(workoutId, { exerciseId: option.id, setNumber: 1, reps: 10, weightKg: 0 });
      }
      setAddingId(null);
      setOpen(false);
      setQuery("");
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} fullWidth size="lg" variant="secondary">
        + Adicionar exercício
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Adicionar exercício">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Buscar exercício..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-text-tertiary">Nenhum exercício encontrado.</p>
            )}
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={pending}
                onClick={() => handleAdd(o)}
                className="flex min-h-12 items-center justify-between rounded-md px-3 text-left active:bg-surface disabled:opacity-50"
              >
                <span className="text-text">{o.name}</span>
                {addingId === o.id ? (
                  <span className="text-xs text-text-tertiary">adicionando…</span>
                ) : (
                  <span className="text-primary text-xl leading-none">+</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </>
  );
}
