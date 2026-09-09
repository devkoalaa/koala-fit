"use client";

import { useEffect } from "react";
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

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-md rounded-t-xl bg-bg-elevated shadow-lg",
          "max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]",
          "animate-[sheet-slide-up_0.25s_ease-out]",
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
