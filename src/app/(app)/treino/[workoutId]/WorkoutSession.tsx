"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { Sheet } from "@/design-system/components/Sheet";
import { cn } from "@/lib/cn";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimer, type RestTimerHandle } from "./RestTimer";
import { finishWorkout, type FinishWorkoutResult } from "./actions";
import type { ExerciseSession } from "./types";

const FEELINGS = [
  { value: 1, emoji: "😩" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
] as const;

export function WorkoutSession({
  workoutId,
  routineName,
  exercises,
}: {
  workoutId: string;
  routineName: string;
  exercises: ExerciseSession[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(exercises[0]?.routineExerciseId ?? null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [result, setResult] = useState<FinishWorkoutResult | null>(null);
  const [pending, startTransition] = useTransition();
  const timerRef = useRef<RestTimerHandle | null>(null);
  const router = useRouter();

  function handleFinish() {
    if (feeling === null) return;
    startTransition(async () => {
      const summary = await finishWorkout(workoutId, feeling);
      setResult(summary);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6">
      <div>
        <p className="text-sm text-text-secondary">Treino em andamento</p>
        <h1 className="text-2xl font-bold text-text">{routineName}</h1>
      </div>

      <div className="flex flex-col gap-3">
        {exercises.map((item) => (
          <ExerciseCard
            key={item.routineExerciseId}
            workoutId={workoutId}
            item={item}
            expanded={expandedId === item.routineExerciseId}
            onToggle={() =>
              setExpandedId((prev) => (prev === item.routineExerciseId ? null : item.routineExerciseId))
            }
            onSetLogged={() => timerRef.current?.start()}
          />
        ))}
      </div>

      <Button size="lg" fullWidth onClick={() => setFinishOpen(true)}>
        Finalizar treino
      </Button>

      <RestTimer onExposeHandle={(h) => (timerRef.current = h)} />

      <Sheet open={finishOpen} onClose={() => !result && setFinishOpen(false)} title={result ? undefined : "Como você se sentiu?"}>
        {!result ? (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              {FEELINGS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFeeling(f.value)}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors",
                    feeling === f.value ? "bg-primary-soft ring-2 ring-primary" : "bg-surface",
                  )}
                  aria-label={`Nota ${f.value}`}
                >
                  {f.emoji}
                </button>
              ))}
            </div>
            <Button fullWidth size="lg" disabled={feeling === null} loading={pending} onClick={handleFinish}>
              Concluir treino
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">🎉</span>
            <div>
              <p className="text-xl font-bold text-text">Treino concluído!</p>
              <p className="text-text-secondary">
                {result.durationMinutes} min · {Math.round(result.volumeKg)} kg de volume total
              </p>
            </div>

            {result.records.length > 0 && (
              <Card className="w-full bg-accent-soft text-left">
                <p className="mb-2 font-semibold text-accent-fg">Recordes pessoais! 🏆</p>
                <ul className="flex flex-col gap-1 text-sm text-accent-fg">
                  {result.records.map((r, i) => (
                    <li key={i}>
                      {r.exerciseName} —{" "}
                      {r.metric === "max_weight" && `nova carga máxima: ${r.value}kg`}
                      {r.metric === "max_reps" && `novo recorde de reps: ${r.value}`}
                      {r.metric === "max_volume" && `novo volume máximo: ${Math.round(r.value)}kg`}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Button fullWidth size="lg" onClick={() => router.push("/hoje")}>
              Voltar para Hoje
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
