"use client";

import { useTransition } from "react";
import { Button } from "@/design-system/components/Button";
import { startWorkout } from "./actions";

export function StartWorkoutButton({ routineId, label }: { routineId: string; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      fullWidth
      loading={pending}
      onClick={() => startTransition(() => startWorkout(routineId))}
    >
      {label}
    </Button>
  );
}
