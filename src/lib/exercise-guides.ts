/**
 * Guias de execução mostrados no botão ⓘ do card do exercício, por nome do
 * exercício (como em load-hints.ts, o catálogo não guarda esse conteúdo).
 */
export type ExerciseGuide = {
  summary: string;
  sections: { title: string; items: string[] }[];
};

const PARALELA_ABDOMINAL: ExerciseGuide = {
  summary:
    "Elevação de joelhos na paralela (\"cadeira do capitão\"): você fica suspenso, apoiado nos antebraços, e leva os joelhos ao peito.",
  sections: [
    {
      title: "Como fazer",
      items: [
        "Suba pelos degraus de baixo, apoie os antebraços nos acolchoados e segure os pegadores. Tire os pés do degrau e deixe as pernas penduradas.",
        "Costas no encosto, ombros firmes empurrando os apoios para baixo.",
        "Contraia a barriga e cole a lombar no encosto antes de começar.",
        "Dobre os joelhos e leve-os em direção ao peito, um pouco para frente — não reto para cima. No alto, enrole levemente o quadril.",
        "Desça devagar e pause um instante embaixo para não balançar.",
        "Para sair, volte os pés ao degrau antes de soltar os braços.",
      ],
    },
    {
      title: "Respiração",
      items: ["Solte o ar subindo, puxe descendo."],
    },
    {
      title: "Se o corpo curvar para trás",
      items: [
        "É o peso das pernas puxando o quadril e tirando a lombar do encosto.",
        "Contraia o abdômen antes de cada repetição e mantenha a lombar colada.",
        "Olhe para frente, sem jogar a cabeça para trás.",
      ],
    },
    {
      title: "Se o antebraço doer",
      items: [
        "Cotovelo bem embaixo do ombro e o antebraço inteiro no acolchoado, não só a ponta perto do cotovelo.",
        "Segure firme os pegadores e empurre para baixo — tira peso do antebraço.",
        "Uma toalha dobrada no apoio ajuda.",
        "Dor aguda no cotovelo ou que dura até o dia seguinte: troque por Abdominal infra (deitado).",
      ],
    },
    {
      title: "Como evoluir",
      items: [
        "Primeiro chegue a 12 repetições em todas as séries.",
        "Depois: suba mais devagar (3 s subindo, 3 s descendo) ou estique mais as pernas.",
        "Com carga: caneleira nos tornozelos ou um halter leve preso entre os pés. Registre o peso da caneleira (de cada uma) no campo de carga.",
      ],
    },
  ],
};

const GUIDES: Record<string, ExerciseGuide> = {
  "Paralela abdominal": PARALELA_ABDOMINAL,
  "Abdominal na paralela": PARALELA_ABDOMINAL,
};

export function getExerciseGuide(exerciseName: string): ExerciseGuide | null {
  return GUIDES[exerciseName] ?? null;
}

// Peso corporal: o campo de carga fica escondido até o usuário pedir
// (caneleira, anilha no colo etc.).
const BODYWEIGHT_EXERCISES = new Set([
  "Paralela abdominal",
  "Abdominal na paralela",
  "Prancha",
  "Abdominal supra",
  "Abdominal infra",
  "Mergulho no banco",
]);

export function isBodyweightExercise(exerciseName: string): boolean {
  return BODYWEIGHT_EXERCISES.has(exerciseName);
}
