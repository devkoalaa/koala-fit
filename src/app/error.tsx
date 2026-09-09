"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/design-system/components/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <TriangleAlert className="h-10 w-10 text-danger" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <h1 className="text-xl font-bold text-text">Algo deu errado</h1>
        <p className="text-sm text-text-secondary">
          Seus dados salvos até agora não foram perdidos. Tente de novo.
        </p>
      </div>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
