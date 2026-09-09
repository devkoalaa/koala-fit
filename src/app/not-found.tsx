import Link from "next/link";
import { Button } from "@/design-system/components/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-4xl">🐨🔍</span>
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
