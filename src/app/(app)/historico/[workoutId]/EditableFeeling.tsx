"use client";

import { useState, useTransition } from "react";
import { Frown, Annoyed, Meh, Smile, Laugh, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { updateWorkoutFeeling } from "@/lib/actions/workout-sets";

const FEELINGS: { value: number; Icon: LucideIcon }[] = [
  { value: 1, Icon: Frown },
  { value: 2, Icon: Annoyed },
  { value: 3, Icon: Meh },
  { value: 4, Icon: Smile },
  { value: 5, Icon: Laugh },
];

export function EditableFeeling({
  workoutId,
  initialFeeling,
}: {
  workoutId: string;
  initialFeeling: number | null;
}) {
  const [feeling, setFeeling] = useState(initialFeeling);
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {FEELINGS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => {
            setFeeling(f.value);
            startTransition(() => updateWorkoutFeeling(workoutId, f.value));
          }}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            feeling === f.value ? "bg-primary-soft text-primary" : "text-text-tertiary",
          )}
          aria-label={`Nota ${f.value}`}
        >
          <f.Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
