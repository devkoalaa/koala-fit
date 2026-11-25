"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { useToast } from "@/design-system/components/Toast";
import { createDoseLog } from "@/lib/actions/doses";

/** Agora no fuso do aparelho, no formato do <input type="datetime-local">. */
function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function NewDoseSheet({ defaultDoseMg }: { defaultDoseMg: number }) {
  const [open, setOpen] = useState(false);
  const [doseMg, setDoseMg] = useState(defaultDoseMg);
  const [takenAt, setTakenAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

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
          <Input
            label="Quando"
            type="datetime-local"
            value={takenAt}
            max={nowLocal()}
            onChange={(e) => setTakenAt(e.target.value)}
          />
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
