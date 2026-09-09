import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { buildExportData, buildSetsCsv } from "@/lib/export";
import { buildAnalysisPrompt } from "@/lib/analysis-prompt";
import { isPeriod, type Period } from "@/lib/period";
import { Card } from "@/design-system/components/Card";
import { PeriodFilter } from "@/components/PeriodFilter";
import { ExportActions } from "./ExportActions";

export default async function ExportarPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const period: Period = isPeriod(params.period) ? params.period : "12w";

  const data = await buildExportData(user.id, period);
  const csv = await buildSetsCsv(user.id, period);
  const json = JSON.stringify(data, null, 2);
  const analysisPrompt = buildAnalysisPrompt(json);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Exportar</h1>
        <p className="text-sm text-text-secondary">
          Leve seus dados para uma IA e peça ajuda para ajustar o treino.
        </p>
      </div>

      <PeriodFilter current={period} />

      <Card>
        <p className="text-sm text-text-secondary">
          {data.workouts.length} treino{data.workouts.length === 1 ? "" : "s"} · {data.body_weight.length}{" "}
          registro{data.body_weight.length === 1 ? "" : "s"} de peso · {data.personal_records.length} recorde
          {data.personal_records.length === 1 ? "" : "s"} pessoal(is)
        </p>
      </Card>

      <ExportActions json={json} csv={csv} analysisPrompt={analysisPrompt} />
    </div>
  );
}
