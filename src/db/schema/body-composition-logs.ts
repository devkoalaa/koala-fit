import {
  pgTable,
  uuid,
  date,
  integer,
  numeric,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Bioimpedance reports from the smart scale (OKOK app). They are read from a
// screenshot sent to the Telegram bot, confirmed by the user there, and written
// by the bot's own DB role — the app only reads them. Everything but the weight
// is nullable because not every report/scale shows every metric.
export const bodyCompositionLogs = pgTable(
  "body_composition_logs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // When the scale took the measurement (as printed on the report).
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    // Calendar day of measuredAt in America/Sao_Paulo, for charts.
    date: date("date", { mode: "string" }).notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
    bmi: numeric("bmi", { precision: 4, scale: 1 }),
    bodyFatPct: numeric("body_fat_pct", { precision: 4, scale: 1 }),
    fatMassKg: numeric("fat_mass_kg", { precision: 5, scale: 2 }),
    leanMassKg: numeric("lean_mass_kg", { precision: 5, scale: 2 }),
    muscleMassKg: numeric("muscle_mass_kg", { precision: 5, scale: 2 }),
    musclePct: numeric("muscle_pct", { precision: 4, scale: 1 }),
    skeletalMuscleKg: numeric("skeletal_muscle_kg", { precision: 5, scale: 2 }),
    skeletalMusclePct: numeric("skeletal_muscle_pct", { precision: 4, scale: 1 }),
    boneMassKg: numeric("bone_mass_kg", { precision: 4, scale: 2 }),
    waterPct: numeric("water_pct", { precision: 4, scale: 1 }),
    waterKg: numeric("water_kg", { precision: 5, scale: 2 }),
    proteinPct: numeric("protein_pct", { precision: 4, scale: 1 }),
    visceralFat: numeric("visceral_fat", { precision: 4, scale: 1 }),
    bmrKcal: integer("bmr_kcal"),
    bodyAge: integer("body_age"),
    // The scale's own 0–100 "overall score".
    score: integer("score"),
    source: text("source").notNull().default("okok"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("body_composition_logs_user_measured_at_unique").on(
      table.userId,
      table.measuredAt,
    ),
  ],
);
