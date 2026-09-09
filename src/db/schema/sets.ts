import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { workouts } from "./workouts";
import { exercises } from "./exercises";

export const sets = pgTable(
  "sets",
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
    setNumber: integer("set_number").notNull(),
    reps: integer("reps").notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sets_workout_exercise_idx").on(table.workoutId, table.exerciseId),
    uniqueIndex("sets_workout_exercise_setnum_unique").on(
      table.workoutId,
      table.exerciseId,
      table.setNumber,
    ),
  ],
);
