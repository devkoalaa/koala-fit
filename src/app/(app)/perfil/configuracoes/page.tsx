import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RestSecondsSetting } from "./RestSecondsSetting";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Configurações</h1>
        <p className="text-sm text-text-secondary">Ajustes de como o app se comporta no treino.</p>
      </div>

      <RestSecondsSetting initialRestSeconds={user.restSeconds} />
    </div>
  );
}
