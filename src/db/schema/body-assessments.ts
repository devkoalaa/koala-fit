import {
  pgTable,
  uuid,
  date,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Avaliações físicas feitas por um profissional (bioimpedância de clínica/academia,
// antropometria, testes de flexibilidade...). Ficam separadas de
// body_composition_logs (balança de casa) porque usam outro aparelho e outro
// método: misturar as duas séries no mesmo gráfico criaria saltos falsos.
// As colunas guardam o que dá para comparar entre avaliações; o resto do
// relatório (análise segmentar, impedâncias, faixas de referência...) vai em
// `details`. Por enquanto são gravadas direto no banco, a partir do PDF.
export const bodyAssessments = pgTable(
  "body_assessments",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull(),
    // Dia de assessedAt em America/Sao_Paulo.
    date: date("date", { mode: "string" }).notNull(),
    // Quem avaliou, registro profissional (CREF/CRN...), onde e com qual aparelho.
    evaluator: text("evaluator"),
    evaluatorRegistry: text("evaluator_registry"),
    place: text("place"),
    device: text("device"),

    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    heightCm: numeric("height_cm", { precision: 4, scale: 1 }),
    bmi: numeric("bmi", { precision: 4, scale: 1 }),
    bodyFatPct: numeric("body_fat_pct", { precision: 4, scale: 1 }),
    fatMassKg: numeric("fat_mass_kg", { precision: 5, scale: 2 }),
    // Massa livre de gordura (tudo que não é gordura).
    leanMassKg: numeric("lean_mass_kg", { precision: 5, scale: 2 }),
    // Massa muscular total (tecido mole magro).
    muscleMassKg: numeric("muscle_mass_kg", { precision: 5, scale: 2 }),
    skeletalMuscleKg: numeric("skeletal_muscle_kg", { precision: 5, scale: 2 }),
    bodyWaterL: numeric("body_water_l", { precision: 4, scale: 1 }),
    intracellularWaterL: numeric("intracellular_water_l", { precision: 4, scale: 1 }),
    extracellularWaterL: numeric("extracellular_water_l", { precision: 4, scale: 1 }),
    // Água extracelular / água total (inchaço/inflamação quando alta).
    ecwRatio: numeric("ecw_ratio", { precision: 4, scale: 3 }),
    proteinKg: numeric("protein_kg", { precision: 4, scale: 1 }),
    mineralKg: numeric("mineral_kg", { precision: 4, scale: 2 }),
    bodyCellMassKg: numeric("body_cell_mass_kg", { precision: 4, scale: 1 }),
    visceralFatAreaCm2: numeric("visceral_fat_area_cm2", { precision: 5, scale: 1 }),
    subcutaneousFatAreaCm2: numeric("subcutaneous_fat_area_cm2", { precision: 5, scale: 1 }),
    // Cintura medida com fita pelo avaliador (não a estimativa do aparelho).
    waistCm: numeric("waist_cm", { precision: 4, scale: 1 }),
    waistHipRatio: numeric("waist_hip_ratio", { precision: 3, scale: 2 }),
    phaseAngleDeg: numeric("phase_angle_deg", { precision: 3, scale: 1 }),
    bmrKcal: integer("bmr_kcal"),
    // Pontuação 0–100 do próprio aparelho.
    score: integer("score"),
    // Banco de Wells (sentar e alcançar).
    sitAndReachCm: numeric("sit_and_reach_cm", { precision: 4, scale: 1 }),

    details: jsonb("details").$type<Record<string, unknown>>(),
    notes: text("notes"),
    nextAssessmentOn: date("next_assessment_on", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("body_assessments_user_assessed_at_unique").on(
      table.userId,
      table.assessedAt,
    ),
  ],
);
