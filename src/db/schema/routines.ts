import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { exercises } from "./exercises";

export const routines = pgTable(
  "routines",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("routines_user_id_idx").on(table.userId)],
);

export const routineExercises = pgTable(
  "routine_exercises",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    routineId: uuid("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    targetSets: integer("target_sets").notNull(),
    targetRepsMin: integer("target_reps_min"),
    targetRepsMax: integer("target_reps_max"),
    targetWeightKg: numeric("target_weight_kg", { precision: 6, scale: 2 }),
    targetDurationSeconds: integer("target_duration_seconds"),
    targetDistanceMeters: numeric("target_distance_meters", {
      precision: 8,
      scale: 2,
    }),
    // Observação livre mostrada no registro do exercício ("joelhos dobrados",
    // "15–20 min").
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("routine_exercises_routine_id_idx").on(table.routineId),
    index("routine_exercises_exercise_id_idx").on(table.exerciseId),
    uniqueIndex("routine_exercises_position_unique").on(
      table.routineId,
      table.position,
    ),
  ],
);
