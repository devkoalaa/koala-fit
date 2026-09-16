"use client";

import { useState, useTransition } from "react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { Button } from "@/design-system/components/Button";
import { useToast } from "@/design-system/components/Toast";
import { REST_SECONDS_MAX, REST_SECONDS_MIN, REST_SECONDS_STEP, formatRest } from "@/lib/rest";
import { updateRestSeconds } from "./actions";

export function RestSecondsSetting({ initialRestSeconds }: { initialRestSeconds: number }) {
  const [restSeconds, setRestSeconds] = useState(initialRestSeconds);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function save() {
    startTransition(async () => {
      await updateRestSeconds(restSeconds);
      show("Tempo de descanso atualizado.", "success");
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="font-semibold text-text">Tempo de descanso</p>
        <p className="text-sm text-text-secondary">
          Quanto tempo o timer conta depois de cada série concluída no treino.
        </p>
      </div>
      <NumberStepper
        value={restSeconds}
        min={REST_SECONDS_MIN}
        max={REST_SECONDS_MAX}
        step={REST_SECONDS_STEP}
        suffix="s"
        onChange={setRestSeconds}
      />
      <p className="text-sm text-text-tertiary">{formatRest(restSeconds)} de descanso.</p>
      <Button fullWidth loading={pending} onClick={save}>
        Salvar
      </Button>
    </Card>
  );
}
