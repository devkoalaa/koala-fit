import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workouts } from "./workouts";
import { exercises } from "./exercises";

export const cardioSessions = pgTable(
  "cardio_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    // free-form: "esteira", "bicicleta", "rua", etc.
    modality: text("modality"),
    durationSeconds: integer("duration_seconds").notNull(),
    distanceMeters: numeric("distance_meters", { precision: 8, scale: 2 }),
    inclinePercent: numeric("incline_percent", { precision: 4, scale: 1 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("cardio_sessions_workout_id_idx").on(table.workoutId)],
);
