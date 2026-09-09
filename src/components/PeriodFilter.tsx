"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { PERIOD_OPTIONS, type Period } from "@/lib/period";

export function PeriodFilter({ current }: { current: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 rounded-md bg-surface p-1">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setPeriod(opt.value)}
          className={cn(
            "min-h-9 flex-1 rounded-md px-2 text-sm font-medium transition-colors",
            current === opt.value ? "bg-bg-elevated text-text shadow-sm" : "text-text-secondary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
