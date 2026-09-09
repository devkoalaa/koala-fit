"use client";

import { useState, useTransition } from "react";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { useToast } from "@/design-system/components/Toast";
import { cn } from "@/lib/cn";
import { WEEKDAY_ORDER, WEEKDAY_LABEL_PT, type Weekday } from "@/lib/date";
import { updateTrainingSchedule } from "./actions";

export function TrainingScheduleEditor({ initialDays }: { initialDays: Weekday[] }) {
  const [selected, setSelected] = useState<Set<Weekday>>(new Set(initialDays));
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function toggle(day: Weekday) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      await updateTrainingSchedule(Array.from(selected));
      show("Agenda de treino atualizada.", "success");
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="font-semibold text-text">Dias de treino</p>
        <p className="text-sm text-text-secondary">
          Usados para calcular sua ofensiva. Mudar aqui não zera o que você já conquistou.
        </p>
      </div>
      <div className="flex justify-between gap-1">
        {WEEKDAY_ORDER.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-md text-sm font-semibold",
              selected.has(day) ? "bg-primary text-primary-fg" : "bg-surface text-text-secondary",
            )}
          >
            {WEEKDAY_LABEL_PT[day].slice(0, 1)}
          </button>
        ))}
      </div>
      <Button fullWidth loading={pending} onClick={save}>
        Salvar agenda
      </Button>
    </Card>
  );
}
