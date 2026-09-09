"use client";

import { useState, useTransition } from "react";
import { Input } from "@/design-system/components/Input";
import { deleteRoutine, renameRoutine } from "./actions";

export function RoutineHeader({ routineId, initialName }: { routineId: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-3">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== initialName) {
            startTransition(() => renameRoutine(routineId, name.trim()));
          }
        }}
        className="text-xl font-bold"
        aria-label="Nome da rotina"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Excluir esta rotina? Essa ação não pode ser desfeita.")) {
            startTransition(() => deleteRoutine(routineId));
          }
        }}
        className="mt-2.5 shrink-0 text-sm font-medium text-danger"
      >
        Excluir
      </button>
    </div>
  );
}
