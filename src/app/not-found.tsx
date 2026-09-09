import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/design-system/components/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-lvh flex-1 flex-col items-center justify-center gap-4 px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)] text-center">
      <SearchX className="h-10 w-10 text-text-tertiary" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <h1 className="text-xl font-bold text-text">Página não encontrada</h1>
        <p className="text-sm text-text-secondary">O que você procurava não existe (mais) por aqui.</p>
      </div>
      <Link href="/hoje">
        <Button>Voltar para Hoje</Button>
      </Link>
    </div>
  );
}
