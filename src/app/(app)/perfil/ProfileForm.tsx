"use client";

import { useState, useTransition } from "react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { Button } from "@/design-system/components/Button";
import { useToast } from "@/design-system/components/Toast";
import { cn } from "@/lib/cn";
import { REST_SECONDS_MAX, REST_SECONDS_MIN, REST_SECONDS_STEP } from "@/lib/rest";
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
  initialRestSeconds,
  initialTheme,
}: {
  initialHeightCm: number | null;
  initialWeeklyGoal: number;
  initialRestSeconds: number;
  initialTheme: ThemePreference;
}) {
  const [heightCm, setHeightCm] = useState(initialHeightCm ?? 170);
  const [weeklyGoal, setWeeklyGoal] = useState(initialWeeklyGoal);
  const [restSeconds, setRestSeconds] = useState(initialRestSeconds);
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function save() {
    startTransition(async () => {
      await updateProfile({ heightCm, weeklyGoal, restSeconds, theme });
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
        onChange={setWeeklyGoal}
      />

      <div className="flex flex-col gap-1.5">
        <NumberStepper
          label="Descanso entre séries"
          value={restSeconds}
          min={REST_SECONDS_MIN}
          max={REST_SECONDS_MAX}
          step={REST_SECONDS_STEP}
          suffix="s"
          onChange={setRestSeconds}
        />
        <span className="text-xs text-text-tertiary">
          Timer que aparece ao concluir uma série no treino.
        </span>
      </div>

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
