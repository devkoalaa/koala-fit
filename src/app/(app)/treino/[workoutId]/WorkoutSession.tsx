"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper, Trophy, Frown, Annoyed, Meh, Smile, Laugh, type LucideIcon } from "lucide-react";
import { Card } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { Sheet } from "@/design-system/components/Sheet";
import { cn } from "@/lib/cn";
import { deleteWorkout } from "@/lib/actions/workout-sets";
import { ExerciseCard } from "./ExerciseCard";
import { AddExtraExerciseSheet, type ExerciseOption } from "./AddExtraExerciseSheet";
import { RestTimer, type RestTimerHandle } from "./RestTimer";
import { finishWorkout, type FinishWorkoutResult } from "./actions";
import type { ExerciseSession } from "./types";

const FEELINGS: { value: number; Icon: LucideIcon }[] = [
  { value: 1, Icon: Frown },
  { value: 2, Icon: Annoyed },
  { value: 3, Icon: Meh },
  { value: 4, Icon: Smile },
  { value: 5, Icon: Laugh },
];

export function WorkoutSession({
  workoutId,
  routineName,
  exercises,
  catalog,
  restSeconds,
}: {
  workoutId: string;
  routineName: string;
  exercises: ExerciseSession[];
  catalog: ExerciseOption[];
  restSeconds: number;
}) {
  // Todos os exercícios começam fechados: abrir o primeiro escondia a lista
  // e dava a impressão de que só ele podia ser preenchido.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [result, setResult] = useState<FinishWorkoutResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();
  const timerRef = useRef<RestTimerHandle | null>(null);
  const router = useRouter();

  // Extras escolhidos agora e ainda sem série registrada. Depois da primeira
  // série o servidor passa a mandá-los em `exercises`, e a cópia local some.
  const [addedExtras, setAddedExtras] = useState<ExerciseSession[]>([]);
  const allExercises = [
    ...exercises,
    ...addedExtras.filter((a) => !exercises.some((e) => e.exerciseId === a.exerciseId)),
  ];

  function handleFinish() {
    if (feeling === null) return;
    startTransition(async () => {
      const summary = await finishWorkout(workoutId, feeling);
      setResult(summary);
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir este treino? Essa ação não pode ser desfeita.")) return;
    startDeleteTransition(async () => {
      await deleteWorkout(workoutId);
      router.push("/hoje");
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">Treino em andamento</p>
          <h1 className="text-2xl font-bold text-text">{routineName}</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-1 shrink-0 text-sm font-medium text-danger disabled:opacity-50"
        >
          {deleting ? "Excluindo…" : "Excluir treino"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {allExercises.map((item) => (
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
        <AddExtraExerciseSheet
          workoutId={workoutId}
          options={catalog}
          existingExerciseIds={allExercises.map((e) => e.exerciseId)}
          onAdded={(session) => {
            setAddedExtras((prev) => [...prev, session]);
            setExpandedId(session.routineExerciseId);
          }}
        />
      </div>

      <Button size="lg" fullWidth onClick={() => setFinishOpen(true)}>
        Finalizar treino
      </Button>

      <RestTimer defaultSeconds={restSeconds} onExposeHandle={(h) => (timerRef.current = h)} />

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
                    "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                    feeling === f.value
                      ? "bg-primary-soft text-primary ring-2 ring-primary"
                      : "bg-surface text-text-secondary",
                  )}
                  aria-label={`Nota ${f.value}`}
                >
                  <f.Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                </button>
              ))}
            </div>
            <Button fullWidth size="lg" disabled={feeling === null} loading={pending} onClick={handleFinish}>
              Concluir treino
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <PartyPopper className="h-10 w-10 text-accent" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-xl font-bold text-text">Treino concluído!</p>
              <p className="text-text-secondary">
                {result.durationMinutes} min · {Math.round(result.volumeKg)} kg de volume total
              </p>
            </div>

            {result.records.length > 0 && (
              <Card className="w-full bg-accent-soft text-left">
                <p className="mb-2 flex items-center gap-1.5 font-semibold text-text">
                  <Trophy className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden="true" />
                  Recordes pessoais!
                </p>
                <ul className="flex flex-col gap-1 text-sm text-text">
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
