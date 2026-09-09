import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-elevated shadow-sm",
        padded && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
