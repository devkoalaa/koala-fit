/**
 * Template for the "copy analysis prompt" button on the Exportar screen.
 * Versioned here so the ask can be tuned without touching the export UI.
 */
export function buildAnalysisPrompt(exportJson: string): string {
  return `Aqui estão os dados do meu treino de academia, exportados do app Koala Fit, em JSON.

Quero que você analise:
1. A evolução de carga e volume por exercício
2. Se a progressão está adequada para o meu histórico
3. Quais exercícios estagnaram (sem evolução de carga/volume recente)
4. Se o volume semanal está coerente com a minha frequência de treino
5. O que ajustar na próxima fase do treino
6. Uma proposta de treino atualizado (rotina, exercícios, séries e repetições)

Importante: isso é orientação geral baseada nos meus dados — não substitui o acompanhamento de um profissional de educação física.

Dados (JSON):
\`\`\`json
${exportJson}
\`\`\`
`;
}
