"use client";

import { useState, useTransition } from "react";
import { Button } from "@/design-system/components/Button";
import { Sheet } from "@/design-system/components/Sheet";
import { startWorkout } from "./actions";

type RoutineOption = { id: string; name: string };

export function StartWorkoutButton({
  routines,
  suggested,
}: {
  routines: RoutineOption[];
  suggested: RoutineOption;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [startingId, setStartingId] = useState<string | null>(null);

  function start(routineId: string) {
    setStartingId(routineId);
    startTransition(() => startWorkout(routineId));
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="lg"
        fullWidth
        loading={pending && startingId === suggested.id}
        disabled={pending}
        onClick={() => start(suggested.id)}
      >
        Começar treino: {suggested.name}
      </Button>
      {routines.length > 1 && (
        <Button variant="ghost" fullWidth disabled={pending} onClick={() => setOpen(true)}>
          Escolher outro treino
        </Button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Qual treino hoje?">
        <div className="flex flex-col gap-1">
          {routines.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={pending}
              onClick={() => start(r.id)}
              className="flex min-h-12 items-center justify-between gap-3 rounded-md px-3 text-left active:bg-surface disabled:opacity-50"
            >
              <span className="text-text">{r.name}</span>
              {pending && startingId === r.id ? (
                <span className="text-xs text-text-tertiary">iniciando…</span>
              ) : r.id === suggested.id ? (
                <span className="text-xs font-medium text-primary">Sugerido</span>
              ) : null}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
