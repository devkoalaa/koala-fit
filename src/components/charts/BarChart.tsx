import { EmptyState } from "@/design-system/components/EmptyState";

export type BarChartBar = { label: string; value: number };

const BAR_MAX_PX = 90;

export function BarChart({
  bars,
  unit,
  emptyLabel = "Sem dados no período",
}: {
  bars: BarChartBar[];
  unit?: string;
  emptyLabel?: string;
}) {
  if (bars.length === 0) {
    return <EmptyState title={emptyLabel} className="border-none py-6" />;
  }

  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="flex items-end gap-1.5 overflow-x-auto pb-1">
      {bars.map((b, i) => (
        <div key={i} className="flex min-w-8 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-text-tertiary">{Math.round(b.value)}</span>
          <div
            className="w-full rounded-t-sm bg-primary"
            style={{ height: `${Math.max(4, (b.value / max) * BAR_MAX_PX)}px` }}
            title={`${b.label}: ${Math.round(b.value)}${unit ?? ""}`}
          />
          <span className="text-[10px] text-text-tertiary">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
