import { cn } from "@/lib/cn";

export type HeatmapDay = {
  date: string;
  // "inactive" = antes do primeiro treino registrado: não conta como falta.
  status: "trained" | "missed" | "off-schedule" | "inactive" | "future";
};

const STATUS_CLASSES: Record<HeatmapDay["status"], string> = {
  trained: "bg-primary",
  missed: "bg-danger-soft",
  "off-schedule": "bg-surface",
  inactive: "bg-surface opacity-40",
  future: "bg-transparent",
};

const STATUS_LABEL: Record<HeatmapDay["status"], string> = {
  trained: "treinou",
  missed: "dia de treino sem treino",
  "off-schedule": "descanso",
  inactive: "antes do primeiro treino",
  future: "",
};

const LEGEND: { status: HeatmapDay["status"]; label: string }[] = [
  { status: "trained", label: "Treinou" },
  { status: "missed", label: "Dia planejado sem treino" },
  { status: "off-schedule", label: "Descanso" },
];

// Linhas seg→dom; só seg/qua/sex rotuladas, como no GitHub, para não poluir.
const WEEKDAY_ROW_LABELS = ["seg", "", "qua", "", "sex", "", ""];

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthOf(isoDate: string): number {
  return Number(isoDate.slice(5, 7)) - 1;
}

function formatDay(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}

/** Calendário de constância: uma coluna por semana (seg–dom), da mais antiga à atual. */
export function HeatmapCalendar({ weeks }: { weeks: HeatmapDay[][] }) {
  if (weeks.length === 0) return null;

  // Rótulo de mês na primeira semana que começa num mês novo. A primeira
  // coluna só ganha rótulo se o mês seguinte não estiver colado nela.
  const monthLabels = weeks.map((week, wi) => {
    const month = monthOf(week[0].date);
    if (wi === 0) {
      const nextChange = weeks.findIndex((w, i) => i > 0 && monthOf(w[0].date) !== month);
      return nextChange === -1 || nextChange >= 3 ? MONTHS_PT[month] : "";
    }
    return month !== monthOf(weeks[wi - 1][0].date) ? MONTHS_PT[month] : "";
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `auto repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        <span />
        {monthLabels.map((label, wi) => (
          <span key={wi} className="overflow-visible text-[10px] leading-4 whitespace-nowrap text-text-tertiary">
            {label}
          </span>
        ))}

        {WEEKDAY_ROW_LABELS.map((rowLabel, di) => (
          <div key={di} className="contents">
            <span className="pr-1.5 text-[10px] leading-none self-center text-text-tertiary">{rowLabel}</span>
            {weeks.map((week) => {
              const day = week[di];
              return (
                <div
                  key={day.date}
                  title={day.status === "future" ? undefined : `${formatDay(day.date)} · ${STATUS_LABEL[day.status]}`}
                  className={cn("aspect-square w-full rounded-[3px]", STATUS_CLASSES[day.status])}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {LEGEND.map((item) => (
          <span key={item.status} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className={cn("h-2.5 w-2.5 rounded-[2px]", STATUS_CLASSES[item.status])} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
