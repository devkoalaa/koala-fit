"use client";

import { useMemo, useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { addExerciseToRoutine } from "./actions";

type ExerciseOption = { id: string; name: string; muscleGroup: string; type: "weight" | "cardio" };

export function AddExerciseSheet({
  routineId,
  options,
}: {
  routineId: string;
  options: ExerciseOption[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [query, options]);

  function handleAdd(exerciseId: string) {
    setAddingId(exerciseId);
    startTransition(async () => {
      await addExerciseToRoutine({ routineId, exerciseId });
      setAddingId(null);
      setOpen(false);
      setQuery("");
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} fullWidth size="lg">
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
                onClick={() => handleAdd(o.id)}
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
