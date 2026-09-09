"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ExerciseSelect({
  options,
  current,
}: {
  options: { id: string; name: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setExercise(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("exercise", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => setExercise(e.target.value)}
      className="h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-base text-text"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
