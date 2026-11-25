"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDoseLog } from "@/lib/actions/doses";

export type DoseEntry = { id: string; when: string; doseMg: number; notes: string | null };

export function DoseItem({ dose }: { dose: DoseEntry }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`Apagar a dose de ${dose.when}?`)) return;
    startTransition(() => deleteDoseLog(dose.id));
  }

  return (
    <li className="flex items-start gap-3 py-2" aria-busy={pending}>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text">
          <span className="font-semibold tabular-nums">
            {dose.doseMg.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mg
          </span>
          <span className="text-text-tertiary"> · {dose.when}</span>
        </p>
        {dose.notes && <p className="text-xs text-text-secondary">{dose.notes}</p>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        aria-label={`Apagar dose de ${dose.when}`}
        className="-my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-tertiary active:bg-surface disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </li>
  );
}
