"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { useToast } from "@/design-system/components/Toast";
import { updateNutritionGoals } from "@/lib/actions/food-logs";
import { NUTRIENTS, type Nutrient } from "@/lib/nutrition";

export type Goals = Record<Nutrient["goalKey"], number | null>;

export function NutritionGoalsSheet({ goals }: { goals: Goals }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<Nutrient["goalKey"], number>>(() => toDraft(goals));
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function save() {
    startTransition(async () => {
      // 0 = sem meta.
      const entries = NUTRIENTS.map((n) => [n.goalKey, draft[n.goalKey] > 0 ? draft[n.goalKey] : null]);
      await updateNutritionGoals(Object.fromEntries(entries) as Goals);
      setOpen(false);
      show("Metas atualizadas.", "success");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(toDraft(goals));
          setOpen(true);
        }}
        className="text-sm font-medium text-primary"
      >
        Metas
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Metas diárias">
        <div className="flex flex-col gap-4">
          {NUTRIENTS.map((n) => (
            <NumberStepper
              key={n.key}
              label={n.label}
              value={draft[n.goalKey]}
              step={n.step}
              min={0}
              max={n.max}
              suffix={n.unit}
              onChange={(v) => setDraft((d) => ({ ...d, [n.goalKey]: v }))}
            />
          ))}
          <p className="text-xs text-text-tertiary">Deixe em 0 para não ter meta.</p>
          <Button fullWidth loading={pending} onClick={save}>
            Salvar
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function toDraft(goals: Goals): Record<Nutrient["goalKey"], number> {
  return Object.fromEntries(NUTRIENTS.map((n) => [n.goalKey, goals[n.goalKey] ?? 0])) as Record<
    Nutrient["goalKey"],
    number
  >;
}
