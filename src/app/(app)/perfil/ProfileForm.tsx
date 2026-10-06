"use client";

import { useState, useTransition } from "react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { Button } from "@/design-system/components/Button";
import { useToast } from "@/design-system/components/Toast";
import { cn } from "@/lib/cn";
import { updateProfile } from "./actions";
import type { ThemePreference } from "@/lib/theme";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

export function ProfileForm({
  initialHeightCm,
  initialWeeklyGoal,
  initialWeeklyGoalMax,
  initialTheme,
}: {
  initialHeightCm: number | null;
  initialWeeklyGoal: number;
  initialWeeklyGoalMax: number | null;
  initialTheme: ThemePreference;
}) {
  const [heightCm, setHeightCm] = useState(initialHeightCm ?? 170);
  const [weeklyGoal, setWeeklyGoal] = useState(initialWeeklyGoal);
  // Teto igual à meta = sem faixa (salva como null).
  const [weeklyGoalMax, setWeeklyGoalMax] = useState(
    Math.max(initialWeeklyGoalMax ?? initialWeeklyGoal, initialWeeklyGoal),
  );
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function save() {
    startTransition(async () => {
      await updateProfile({
        heightCm,
        weeklyGoal,
        weeklyGoalMax: weeklyGoalMax > weeklyGoal ? weeklyGoalMax : null,
        theme,
      });
      show("Perfil atualizado.", "success");
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <NumberStepper label="Altura" value={heightCm} min={100} max={250} suffix="cm" onChange={setHeightCm} />
      <NumberStepper
        label="Meta semanal de treinos"
        value={weeklyGoal}
        min={0}
        max={14}
        onChange={(v) => {
          setWeeklyGoal(v);
          setWeeklyGoalMax((max) => Math.max(max, v));
        }}
      />
      <NumberStepper
        label="Meta semanal (máximo)"
        value={weeklyGoalMax}
        min={weeklyGoal}
        max={14}
        onChange={setWeeklyGoalMax}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text">Tema</span>
        <div className="flex gap-1 rounded-md bg-surface p-1">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "min-h-9 flex-1 rounded-md px-2 text-sm font-medium transition-colors",
                theme === opt.value ? "bg-bg-elevated text-text shadow-sm" : "text-text-secondary",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button fullWidth loading={pending} onClick={save}>
        Salvar
      </Button>
    </Card>
  );
}
