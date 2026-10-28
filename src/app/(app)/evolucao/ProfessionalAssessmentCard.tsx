import { BadgeCheck } from "lucide-react";
import { bodyAssessments, bodyCompositionLogs } from "@/db/schema";
import { Card } from "@/design-system/components/Card";
import { formatDateBR } from "@/lib/date";
import {
  ASSESSMENT_ONLY_METRICS,
  COMPARABLE_METRICS,
  assessmentValue,
  formatAssessmentMetric,
  referenceFor,
  scaleValue,
} from "@/lib/body-assessment";

type Props = {
  assessment: typeof bodyAssessments.$inferSelect;
  // Última medição da balança até o dia da avaliação, para comparar.
  scale?: typeof bodyCompositionLogs.$inferSelect;
};

export function ProfessionalAssessmentCard({ assessment, scale }: Props) {
  const comparable = COMPARABLE_METRICS.flatMap((m) => {
    const value = assessmentValue(assessment, m);
    return value === null ? [] : [{ metric: m, value, scaleValue: scale ? scaleValue(scale, m) : null }];
  });
  const exclusive = ASSESSMENT_ONLY_METRICS.flatMap((m) => {
    const value = assessmentValue(assessment, m);
    return value === null ? [] : [{ metric: m, value, reference: referenceFor(assessment, m) }];
  });
  const byline = [assessment.device, assessment.evaluator && `${assessment.evaluator}${assessment.evaluatorRegistry ? ` (${assessment.evaluatorRegistry})` : ""}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="border-primary/40">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="flex items-center gap-1.5 font-semibold text-text">
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
            Avaliação profissional
          </p>
          {byline && <p className="text-xs text-text-tertiary">{byline}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
          {formatDateBR(assessment.date)}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-text-tertiary">
            <th className="pb-1 text-left font-normal" />
            <th className="pb-1 text-right font-normal">Avaliação</th>
            {scale && <th className="pb-1 pl-3 text-right font-normal">Balança {formatDateBR(scale.date).slice(0, 5)}</th>}
          </tr>
        </thead>
        <tbody>
          {comparable.map(({ metric, value, scaleValue }) => (
            <tr key={metric.id}>
              <td className="py-0.5 text-text-secondary">{metric.label}</td>
              <td className="py-0.5 text-right font-medium whitespace-nowrap text-text tabular-nums">
                {formatAssessmentMetric(value, metric)}
              </td>
              {scale && (
                <td className="py-0.5 pl-3 text-right whitespace-nowrap text-text-tertiary tabular-nums">
                  {scaleValue === null ? "—" : formatAssessmentMetric(scaleValue, metric)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {exclusive.length > 0 && (
        <>
          <p className="mt-4 mb-1 text-xs font-semibold text-text-tertiary uppercase">Só na avaliação</p>
          <dl className="flex flex-col gap-1 text-sm">
            {exclusive.map(({ metric, value, reference }) => (
              <div key={metric.id} className="flex justify-between gap-2">
                <dt className="min-w-0 text-text-secondary">{metric.label}</dt>
                <dd className="shrink-0 text-right whitespace-nowrap tabular-nums">
                  <span className="font-medium text-text">{formatAssessmentMetric(value, metric)}</span>
                  {reference && <span className="ml-1.5 text-xs text-text-tertiary">ref. {reference}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {assessment.notes && <p className="mt-4 text-sm whitespace-pre-line text-text-secondary">{assessment.notes}</p>}

      {assessment.nextAssessmentOn && (
        <p className="mt-3 text-xs text-text-tertiary">Reavaliação em {formatDateBR(assessment.nextAssessmentOn)}</p>
      )}
    </Card>
  );
}
