"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useHasMounted } from "@/lib/use-has-mounted";

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  const mounted = useHasMounted();

  // Stays rendered (playing the exit animation) for one tick after `open`
  // goes false, instead of vanishing instantly. Derived during render (the
  // "adjusting state on a prop change" pattern) rather than an effect, since
  // there's no timer involved — actual unmount is driven by onAnimationEnd.
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRendered(true);
      setClosing(false);
    } else {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!rendered || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40",
          closing
            ? "animate-[backdrop-fade-out_0.2s_ease-in_forwards]"
            : "animate-[backdrop-fade-in_0.2s_ease-out]",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onAnimationEnd={() => {
          if (closing) {
            setRendered(false);
            setClosing(false);
          }
        }}
        className={cn(
          "relative w-full max-w-md rounded-t-xl bg-bg-elevated shadow-lg",
          "max-h-[calc(85vh-var(--safe-top))] overflow-y-auto pb-[var(--safe-bottom)]",
          closing
            ? "animate-[sheet-slide-down_0.2s_ease-in_forwards]"
            : "animate-[sheet-slide-up_0.25s_ease-out]",
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
        {title && (
          <div className="px-5 pt-3 pb-1">
            <h2 className="text-lg font-semibold text-text">{title}</h2>
          </div>
        )}
        <div className="p-5 pt-2">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
