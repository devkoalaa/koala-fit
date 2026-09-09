import type { exerciseTypeEnum, muscleGroupEnum } from "../schema/enums";

type MuscleGroup = (typeof muscleGroupEnum.enumValues)[number];
type ExerciseType = (typeof exerciseTypeEnum.enumValues)[number];

export type SeedExercise = {
  name: string;
  muscleGroup: MuscleGroup;
  type: ExerciseType;
};

// Global catalog seeded on `pnpm seed`. Edit/extend freely — these become
// `exercises` rows with user_id = NULL, shared across the account.
export const exerciseCatalog: SeedExercise[] = [
  // Peito
  { name: "Supino reto máquina", muscleGroup: "chest", type: "weight" },
  { name: "Supino reto barra", muscleGroup: "chest", type: "weight" },
  { name: "Supino inclinado halteres", muscleGroup: "chest", type: "weight" },
  { name: "Crucifixo máquina (peck deck)", muscleGroup: "chest", type: "weight" },
  { name: "Crossover", muscleGroup: "chest", type: "weight" },

  // Costas
  { name: "Puxada frente", muscleGroup: "back", type: "weight" },
  { name: "Puxada triângulo", muscleGroup: "back", type: "weight" },
  { name: "Remada baixa", muscleGroup: "back", type: "weight" },
  { name: "Remada curvada barra", muscleGroup: "back", type: "weight" },
  { name: "Remada cavalinho", muscleGroup: "back", type: "weight" },
  { name: "Pulldown", muscleGroup: "back", type: "weight" },

  // Ombros
  { name: "Desenvolvimento máquina", muscleGroup: "shoulders", type: "weight" },
  { name: "Desenvolvimento halteres", muscleGroup: "shoulders", type: "weight" },
  { name: "Elevação lateral", muscleGroup: "shoulders", type: "weight" },
  { name: "Elevação frontal", muscleGroup: "shoulders", type: "weight" },
  { name: "Remada alta", muscleGroup: "shoulders", type: "weight" },

  // Bíceps
  { name: "Rosca direta barra", muscleGroup: "biceps", type: "weight" },
  { name: "Rosca alternada halteres", muscleGroup: "biceps", type: "weight" },
  { name: "Rosca scott", muscleGroup: "biceps", type: "weight" },
  { name: "Rosca cabo", muscleGroup: "biceps", type: "weight" },

  // Tríceps
  { name: "Tríceps pulley", muscleGroup: "triceps", type: "weight" },
  { name: "Tríceps testa", muscleGroup: "triceps", type: "weight" },
  { name: "Tríceps corda", muscleGroup: "triceps", type: "weight" },
  { name: "Mergulho no banco", muscleGroup: "triceps", type: "weight" },

  // Antebraço
  { name: "Rosca de punho", muscleGroup: "forearms", type: "weight" },

  // Pernas
  { name: "Leg press", muscleGroup: "legs", type: "weight" },
  { name: "Cadeira extensora", muscleGroup: "legs", type: "weight" },
  { name: "Cadeira flexora", muscleGroup: "legs", type: "weight" },
  { name: "Agachamento livre", muscleGroup: "legs", type: "weight" },
  { name: "Agachamento smith", muscleGroup: "legs", type: "weight" },
  { name: "Cadeira adutora", muscleGroup: "legs", type: "weight" },
  { name: "Cadeira abdutora", muscleGroup: "legs", type: "weight" },
  { name: "Afundo", muscleGroup: "legs", type: "weight" },

  // Glúteos
  { name: "Elevação pélvica", muscleGroup: "glutes", type: "weight" },
  { name: "Glúteo na polia", muscleGroup: "glutes", type: "weight" },

  // Panturrilha
  { name: "Panturrilha em pé", muscleGroup: "calves", type: "weight" },
  { name: "Panturrilha sentado", muscleGroup: "calves", type: "weight" },

  // Abdômen
  { name: "Prancha", muscleGroup: "abs", type: "weight" },
  { name: "Abdominal supra", muscleGroup: "abs", type: "weight" },
  { name: "Abdominal infra", muscleGroup: "abs", type: "weight" },
  { name: "Abdominal na polia", muscleGroup: "abs", type: "weight" },

  // Corpo inteiro
  { name: "Levantamento terra", muscleGroup: "full_body", type: "weight" },

  // Cardio
  { name: "Esteira", muscleGroup: "cardio", type: "cardio" },
  { name: "Bicicleta ergométrica", muscleGroup: "cardio", type: "cardio" },
  { name: "Elíptico", muscleGroup: "cardio", type: "cardio" },
  { name: "Escada (stairmaster)", muscleGroup: "cardio", type: "cardio" },
  { name: "Remo (cardio)", muscleGroup: "cardio", type: "cardio" },
  { name: "Corrida na rua", muscleGroup: "cardio", type: "cardio" },
];
