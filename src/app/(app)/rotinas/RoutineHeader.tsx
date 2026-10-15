"use client";

import { useState, useTransition } from "react";
import { Input } from "@/design-system/components/Input";
import { deleteRoutine, renameRoutine, setRoutineArchived } from "./actions";

export function RoutineHeader({
  routineId,
  initialName,
  archived,
}: {
  routineId: string;
  initialName: string;
  archived: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
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
        <div className="mt-2.5 flex shrink-0 items-center gap-4">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setRoutineArchived(routineId, !archived))}
            className="text-sm font-medium text-primary"
          >
            {archived ? "Desarquivar" : "Arquivar"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm("Excluir esta rotina? Essa ação não pode ser desfeita.")) {
                startTransition(() => deleteRoutine(routineId));
              }
            }}
            className="text-sm font-medium text-danger"
          >
            Excluir
          </button>
        </div>
      </div>
      {archived && (
        <p className="text-sm text-text-secondary">
          Rotina arquivada: não entra na sugestão nem na escolha de treino.
        </p>
      )}
    </div>
  );
}
