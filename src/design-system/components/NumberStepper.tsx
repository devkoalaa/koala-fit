"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  suffix?: string;
  className?: string;
  disabled?: boolean;
};

function clamp(value: number, min?: number, max?: number) {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

function roundToStep(value: number, step: number) {
  const decimals = (step.toString().split(".")[1] ?? "").length;
  return Number(value.toFixed(decimals));
}

/**
 * Numeric input built for one-handed use: +/- buttons at 44px+ and a
 * decimal-mode field for direct entry, no keyboard reliance required.
 */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  label,
  suffix,
  className,
  disabled = false,
}: NumberStepperProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(String(value));
  // Resync the editable draft when `value` changes from outside (+/- buttons,
  // external state) without an effect — see https://react.dev/learn/you-might-not-need-an-effect
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }

  function commit(next: number) {
    const clamped = clamp(roundToStep(next, step), min, max);
    onChange(clamped);
  }

  function handleBlur() {
    const parsed = Number(draft.replace(",", "."));
    if (Number.isFinite(parsed)) {
      commit(parsed);
    } else {
      setDraft(String(value));
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="text-sm font-medium text-text">{label}</span>}
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={() => commit(value - step)}
          aria-label="Diminuir"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border",
            "bg-surface text-xl font-semibold text-text active:bg-surface-hover",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          −
        </button>

        {/* The suffix sits in normal flow, not absolutely: side by side with
            two steppers the field is only ~48px wide, and an overlaid suffix
            lands right on top of the centred value. */}
        <div className="flex min-w-0 flex-1 items-center rounded-md border border-border bg-bg-elevated px-2">
          <input
            id={inputId}
            inputMode="decimal"
            value={draft}
            disabled={disabled}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-xl font-semibold text-text tabular-nums outline-none",
              suffix ? "text-right" : "text-center",
            )}
          />
          {suffix && (
            <span className="pointer-events-none ml-1 shrink-0 text-sm text-text-tertiary">
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => commit(value + step)}
          aria-label="Aumentar"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border",
            "bg-surface text-xl font-semibold text-text active:bg-surface-hover",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}
