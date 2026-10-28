import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { themeEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  heightCm: integer("height_cm"),
  theme: themeEnum("theme").notNull().default("system"),
  weeklyGoal: integer("weekly_goal").notNull().default(3),
  // Teto opcional da meta semanal: com weeklyGoal = 2 e weeklyGoalMax = 3 a
  // meta vira "2–3x por semana" (2 já conta como meta batida).
  weeklyGoalMax: integer("weekly_goal_max"),
  // Descanso padrão entre séries, em segundos — alimenta o timer da tela de
  // treino em andamento.
  restSeconds: integer("rest_seconds").notNull().default(90),
  // Metas diárias da aba Alimentação (null = sem meta).
  kcalGoal: integer("kcal_goal"),
  proteinGoalG: integer("protein_goal_g"),
  carbsGoalG: integer("carbs_goal_g"),
  fatGoalG: integer("fat_goal_g"),
  fiberGoalG: integer("fiber_goal_g"),
  waterGoalMl: integer("water_goal_ml"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
