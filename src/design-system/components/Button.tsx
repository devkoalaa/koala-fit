import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-hover disabled:bg-primary/50",
  secondary:
    "bg-surface text-text hover:bg-surface-hover active:bg-surface-hover border border-border",
  ghost: "bg-transparent text-text hover:bg-surface active:bg-surface-hover",
  danger:
    "bg-danger text-danger-fg hover:bg-danger-hover active:bg-danger-hover disabled:bg-danger/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-base gap-2",
  lg: "h-13 px-6 text-lg gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md font-medium",
        "transition-[background-color,color,transform,opacity] duration-150 ease-out",
        "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
