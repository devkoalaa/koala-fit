import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/db/client";
import { trainingSchedule } from "@/db/schema";
import type { Weekday } from "@/lib/date";
import { ProfileForm } from "./ProfileForm";
import { TrainingScheduleEditor } from "./TrainingScheduleEditor";
import { LogoutButton } from "./LogoutButton";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const scheduleRows = await db
    .select({ weekday: trainingSchedule.weekday })
    .from(trainingSchedule)
    .where(eq(trainingSchedule.userId, user.id));

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Perfil</h1>
        <p className="text-sm text-text-secondary">{user.email}</p>
      </div>

      <ProfileForm initialHeightCm={user.heightCm} initialWeeklyGoal={user.weeklyGoal} initialTheme={user.theme} />

      <TrainingScheduleEditor initialDays={scheduleRows.map((r) => r.weekday as Weekday)} />

      <Link
        href="/perfil/configuracoes"
        className="flex min-h-12 items-center justify-between rounded-lg border border-border bg-bg-elevated px-4 text-text transition-transform duration-150 active:scale-[0.98]"
      >
        <span className="font-medium">Configurações</span>
        <span className="text-text-tertiary" aria-hidden="true">
          ›
        </span>
      </Link>

      <Link
        href="/perfil/exportar"
        className="flex min-h-12 items-center justify-between rounded-lg border border-border bg-bg-elevated px-4 text-text transition-transform duration-150 active:scale-[0.98]"
      >
        <span className="font-medium">Exportar dados</span>
        <span className="text-text-tertiary" aria-hidden="true">
          ›
        </span>
      </Link>

      {/* Temporário: o app instalado não tem barra de endereço, então /debug
          precisa de um ponto de entrada aqui dentro. Remover junto com a rota. */}
      <Link
        href="/debug"
        className="flex min-h-12 items-center justify-between rounded-lg border border-border bg-bg-elevated px-4 text-text transition-transform duration-150 active:scale-[0.98]"
      >
        <span className="font-medium">Diagnóstico</span>
        <span className="text-text-tertiary" aria-hidden="true">
          ›
        </span>
      </Link>

      <LogoutButton />
    </div>
  );
}
