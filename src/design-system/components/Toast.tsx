"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useHasMounted } from "@/lib/use-has-mounted";

type ToastVariant = "default" | "success" | "danger";
type ToastItem = { id: string; message: string; variant: ToastVariant };

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  default: "bg-text text-bg",
  success: "bg-primary text-primary-fg",
  danger: "bg-danger text-danger-fg",
};

const DISMISS_AFTER_MS = 3500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useHasMounted();

  const show = useCallback((message: string, variant: ToastVariant = "default") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_AFTER_MS);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-space)+1rem)] z-[60] flex flex-col items-center gap-2 px-4">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                role="status"
                className={cn(
                  "pointer-events-auto w-full max-w-sm rounded-md px-4 py-3 text-sm font-medium shadow-lg",
                  variantClasses[toast.variant],
                )}
              >
                {toast.message}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
