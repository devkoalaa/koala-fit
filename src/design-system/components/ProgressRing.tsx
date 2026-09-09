import { cn } from "@/lib/cn";

export type ProgressRingProps = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "accent";
  label?: React.ReactNode;
  className?: string;
};

export function ProgressRing({
  value,
  max,
  size = 72,
  strokeWidth = 8,
  color = "primary",
  label,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference * (1 - progress);
  const strokeColor = color === "accent" ? "var(--color-accent)" : "var(--color-primary)";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ?? (
          <span className="text-sm font-semibold text-text">
            {value}/{max}
          </span>
        )}
      </div>
    </div>
  );
}
