import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-bg-elevated px-3.5 text-base text-text",
          "placeholder:text-text-tertiary",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          error && "border-danger",
          className,
        )}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-sm text-text-tertiary">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
