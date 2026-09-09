import { EmptyState } from "@/design-system/components/EmptyState";

export type LineChartPoint = { label: string; value: number };

const WIDTH = 320;
const HEIGHT = 120;
const PADDING = 8;

/** Minimal SVG line chart with a linear-regression trend line. No external dep. */
export function LineChart({
  points,
  unit,
  emptyLabel = "Sem dados no período",
}: {
  points: LineChartPoint[];
  unit?: string;
  emptyLabel?: string;
}) {
  if (points.length === 0) {
    return <EmptyState title={emptyLabel} className="border-none py-6" />;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = points.length;
  const stepX = n > 1 ? (WIDTH - PADDING * 2) / (n - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PADDING + i * stepX,
    y: HEIGHT - PADDING - ((p.value - min) / range) * (HEIGHT - PADDING * 2),
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

  // Linear regression trend line over index vs. value.
  const sumX = points.reduce((s, _, i) => s + i, 0);
  const sumY = values.reduce((s, v) => s + v, 0);
  const sumXY = points.reduce((s, p, i) => s + i * p.value, 0);
  const sumXX = points.reduce((s, _, i) => s + i * i, 0);
  const denom = n * sumXX - sumX * sumX || 1;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const trendY = (i: number) =>
    HEIGHT - PADDING - ((intercept + slope * i - min) / range) * (HEIGHT - PADDING * 2);

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
        role="img"
        aria-label="Gráfico de evolução"
      >
        <line
          x1={PADDING}
          y1={trendY(0)}
          x2={WIDTH - PADDING}
          y2={trendY(n - 1)}
          stroke="var(--color-text-tertiary)"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={2.5} fill="var(--color-primary)" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-text-tertiary">
        <span>{points[0].label}</span>
        <span>
          {max}
          {unit} máx
        </span>
        <span>{points[n - 1].label}</span>
      </div>
    </div>
  );
}
