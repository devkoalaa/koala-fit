"use client";

import { useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { deleteFoodLog } from "@/lib/actions/food-logs";

export type FoodLogEntry = {
  id: string;
  time: string;
  description: string;
  quantity: string | null;
  kcal: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  waterMl: number | null;
  fromPhoto: boolean;
};

function grams(value: number | null, label: string): string | null {
  return value === null ? null : `${label} ${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} g`;
}

export function FoodLogItem({ entry }: { entry: FoodLogEntry }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`Apagar "${entry.description}"?`)) return;
    startTransition(() => deleteFoodLog(entry.id));
  }

  const macros = [grams(entry.proteinG, "P"), grams(entry.carbsG, "C"), grams(entry.fatG, "G")].filter(Boolean);
  if (entry.waterMl) macros.push(`${entry.waterMl.toLocaleString("pt-BR")} ml`);

  return (
    <li className="flex items-start gap-3 py-2" aria-busy={pending}>
      <span className="w-10 shrink-0 pt-0.5 text-xs text-text-tertiary tabular-nums">{entry.time}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm text-text">
          <span className="min-w-0">{entry.description}</span>
          {entry.fromPhoto && (
            <Camera className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={2} aria-label="Registrado por foto" />
          )}
        </p>
        <p className="text-xs text-text-tertiary">
          {[entry.quantity, ...macros].filter(Boolean).join(" · ")}
        </p>
      </div>
      <span className="shrink-0 pt-0.5 text-sm font-medium text-text tabular-nums">{entry.kcal} kcal</span>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        aria-label={`Apagar ${entry.description}`}
        className="-my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-tertiary active:bg-surface disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </li>
  );
}
