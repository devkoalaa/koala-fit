"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { formatDateBR } from "@/lib/date";
import { deleteBodyWeightLog, updateBodyWeightLog } from "@/lib/actions/body-weight";

export type WeightLog = { id: string; date: string; weightKg: number };

export function WeightLogsSheet({ logs }: { logs: WeightLog[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(0);
  const [pending, startTransition] = useTransition();

  function startEdit(log: WeightLog) {
    setEditingId(log.id);
    setDraft(log.weightKg);
  }

  function save(id: string) {
    startTransition(async () => {
      await updateBodyWeightLog(id, Math.round(draft * 100) / 100);
      setEditingId(null);
    });
  }

  function remove(log: WeightLog) {
    if (!window.confirm(`Apagar a pesagem de ${formatDateBR(log.date)} (${log.weightKg} kg)?`)) return;
    startTransition(() => deleteBodyWeightLog(log.id));
  }

  if (logs.length === 0) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-primary">
        Pesagens
      </button>
      <Sheet
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingId(null);
        }}
        title="Pesagens"
      >
        <ul className="flex flex-col divide-y divide-border">
          {logs.map((log) =>
            editingId === log.id ? (
              <li key={log.id} className="flex flex-col gap-3 py-3">
                <p className="text-sm text-text-secondary">{formatDateBR(log.date)}</p>
                <NumberStepper value={draft} onChange={setDraft} step={0.1} min={20} max={300} suffix="kg" />
                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth disabled={pending} onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button fullWidth loading={pending} onClick={() => save(log.id)}>
                    Salvar
                  </Button>
                </div>
              </li>
            ) : (
              <li key={log.id} className="flex min-h-12 items-center justify-between gap-3 py-1">
                <span className="text-sm text-text-secondary">{formatDateBR(log.date)}</span>
                <span className="flex-1 text-right font-semibold text-text">{log.weightKg} kg</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startEdit(log)}
                  aria-label={`Editar pesagem de ${formatDateBR(log.date)}`}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary active:bg-surface disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(log)}
                  aria-label={`Apagar pesagem de ${formatDateBR(log.date)}`}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-danger active:bg-surface disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            ),
          )}
        </ul>
      </Sheet>
    </>
  );
}
