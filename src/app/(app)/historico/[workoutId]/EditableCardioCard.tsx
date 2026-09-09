"use client";

import { useState, useTransition } from "react";
import { Card } from "@/design-system/components/Card";
import { NumberStepper } from "@/design-system/components/NumberStepper";
import { logCardio } from "@/lib/actions/workout-sets";

export function EditableCardioCard({
  workoutId,
  exerciseId,
  exerciseName,
  initialDurationSeconds,
  initialDistanceMeters,
  initialInclinePercent,
}: {
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  initialDurationSeconds: number;
  initialDistanceMeters: number | null;
  initialInclinePercent: number | null;
}) {
  const [duration, setDuration] = useState(Math.round(initialDurationSeconds / 60));
  const [distance, setDistance] = useState((initialDistanceMeters ?? 0) / 1000);
  const [incline, setIncline] = useState(initialInclinePercent ?? 0);
  const [, startTransition] = useTransition();

  function save(patch: { duration?: number; distance?: number; incline?: number }) {
    const nextDuration = patch.duration ?? duration;
    const nextDistance = patch.distance ?? distance;
    const nextIncline = patch.incline ?? incline;

    startTransition(() =>
      logCardio(workoutId, {
        exerciseId,
        durationSeconds: Math.round(nextDuration * 60),
        distanceMeters: nextDistance > 0 ? nextDistance * 1000 : undefined,
        inclinePercent: nextIncline > 0 ? nextIncline : undefined,
      }),
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-semibold text-text">{exerciseName}</p>
      <div className="flex flex-col gap-3">
        <NumberStepper
          label="Duração (min)"
          value={duration}
          min={1}
          max={180}
          onChange={(v) => {
            setDuration(v);
            save({ duration: v });
          }}
        />
        <NumberStepper
          label="Distância (km)"
          value={distance}
          min={0}
          max={100}
          step={0.1}
          onChange={(v) => {
            setDistance(v);
            save({ distance: v });
          }}
        />
        <NumberStepper
          label="Inclinação (%)"
          value={incline}
          min={0}
          max={20}
          step={0.5}
          onChange={(v) => {
            setIncline(v);
            save({ incline: v });
          }}
        />
      </div>
    </Card>
  );
}
