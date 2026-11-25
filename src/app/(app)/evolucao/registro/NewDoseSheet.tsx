"use client";

import { useId, useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { useToast } from "@/design-system/components/Toast";
import { createDoseLog } from "@/lib/actions/doses";

/** Agora no fuso do aparelho, no formato do <input type="datetime-local">. */
function nowLocal(): string {
  return nowLocalFrom(new Date());
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "2026-11-25T15:24" → "Hoje às 15:24", "Ontem às 08:00" ou "seg, 23/11 às 08:00". */
function formatLocal(value: string): string {
  if (!value) return "Escolher";
  const [date, time] = value.split("T");
  const today = nowLocal().slice(0, 10);
  const d = new Date(`${date}T12:00:00`);
  const yesterday = new Date(`${today}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  const day =
    date === today
      ? "Hoje"
      : date === nowLocalFrom(yesterday).slice(0, 10)
        ? "Ontem"
        : `${WEEKDAYS[d.getDay()]}, ${date.slice(8, 10)}/${date.slice(5, 7)}`;
  return `${day} às ${time}`;
}

function nowLocalFrom(d: Date): string {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}

export function NewDoseSheet({ defaultDoseMg }: { defaultDoseMg: number }) {
  const [open, setOpen] = useState(false);
  const [doseMg, setDoseMg] = useState(defaultDoseMg);
  const [takenAt, setTakenAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();
  const whenId = useId();

  function openSheet() {
    setDoseMg(defaultDoseMg);
    setTakenAt(nowLocal());
    setNotes("");
    setError(null);
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      try {
        await createDoseLog({ doseMg, takenAt, notes });
        setOpen(false);
        show("Dose registrada.", "success");
      } catch {
        setError("Não deu para salvar. Confira a data (não pode ser no futuro).");
      }
    });
  }

  return (
    <>
      <Button fullWidth onClick={openSheet}>
        + Registrar dose
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Registrar dose">
        <div className="flex flex-col gap-4">
          <NumberStepper label="Dose" value={doseMg} onChange={setDoseMg} step={0.25} min={0.25} max={50} suffix="mg" />
          {/*
            O <input type="datetime-local"> do iPhone ignora a largura (vaza da
            tela) e mostra a data no idioma do aparelho. Ele fica invisível por
            cima de um campo nosso, em português; o toque abre o seletor nativo.
          */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={whenId} className="text-sm font-medium text-text">
              Quando
            </label>
            <div className="relative">
              <div className="flex h-11 w-full items-center rounded-md border border-border bg-bg-elevated px-3.5 text-base text-text">
                {formatLocal(takenAt)}
              </div>
              <input
                id={whenId}
                type="datetime-local"
                value={takenAt}
                max={nowLocal()}
                onChange={(e) => setTakenAt(e.target.value)}
                className="absolute inset-0 h-full w-full min-w-0 cursor-pointer appearance-none opacity-0"
              />
            </div>
          </div>
          <Input
            label="Observações"
            placeholder="Local, efeitos…"
            value={notes}
            maxLength={500}
            onChange={(e) => setNotes(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button fullWidth loading={pending} disabled={!takenAt} onClick={save}>
            Salvar
          </Button>
        </div>
      </Sheet>
    </>
  );
}
