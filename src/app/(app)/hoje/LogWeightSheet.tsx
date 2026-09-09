"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { logBodyWeight } from "@/lib/actions/body-weight";

export function LogWeightSheet({ currentWeightKg }: { currentWeightKg: number | null }) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState(currentWeightKg ?? 70);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-primary"
      >
        Registrar peso
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Registrar peso de hoje">
        <div className="flex flex-col gap-5">
          <NumberStepper value={weight} onChange={setWeight} step={0.1} min={20} max={300} suffix="kg" />
          <Button
            fullWidth
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                await logBodyWeight(weight);
                setOpen(false);
              })
            }
          >
            Salvar
          </Button>
        </div>
      </Sheet>
    </>
  );
}
