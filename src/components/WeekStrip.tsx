import { Check, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { WEEKDAY_LABEL_PT } from "@/lib/date";
import type { WeekDayInfo } from "@/lib/streak";

const STATUS_CLASSES: Record<WeekDayInfo["status"], string> = {
  done: "bg-primary text-primary-fg border-primary",
  bonus: "bg-accent text-accent-fg border-accent",
  pending: "bg-transparent text-text-secondary border-border",
  missed: "bg-danger-soft text-danger border-danger/40",
  "off-schedule": "bg-transparent text-text-tertiary border-transparent",
};

export function WeekStrip({ days }: { days: WeekDayInfo[] }) {
  return (
    <div className="flex justify-between gap-1">
      {days.map((day) => (
        <div key={day.date} className="flex flex-col items-center gap-1">
          <span className="text-xs text-text-tertiary">{WEEKDAY_LABEL_PT[day.weekday]}</span>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
              STATUS_CLASSES[day.status],
            )}
            title={day.status}
          >
            {day.status === "done" && <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
            {day.status === "bonus" && <Star className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
            {day.status === "missed" && <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
          </div>
        </div>
      ))}
    </div>
  );
}
