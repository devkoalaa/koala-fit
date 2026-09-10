"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkout } from "@/lib/actions/workout-sets";

export function DeleteWorkoutButton({ workoutId }: { workoutId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!window.confirm("Excluir este treino? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      await deleteWorkout(workoutId);
      router.push("/historico");
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="mt-1 shrink-0 text-sm font-medium text-danger disabled:opacity-50"
    >
      {pending ? "Excluindo…" : "Excluir treino"}
    </button>
  );
}
