import { cn } from "@/lib/cn";

export type HeatmapDay = { date: string; status: "trained" | "missed" | "off-schedule" | "future" };

const STATUS_CLASSES: Record<HeatmapDay["status"], string> = {
  trained: "bg-primary",
  missed: "bg-danger-soft",
  "off-schedule": "bg-surface",
  future: "bg-transparent",
};

/** GitHub-style constancy calendar: one column per Mon-Sun week, oldest to newest. */
export function HeatmapCalendar({ weeks }: { weeks: HeatmapDay[][] }) {
  if (weeks.length === 0) return null;

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className={cn("h-3 w-3 rounded-[3px]", STATUS_CLASSES[day.status])}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
