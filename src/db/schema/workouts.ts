import {
  pgTable,
  uuid,
  date,
  integer,
  smallint,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { routines } from "./routines";

export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    routineId: uuid("routine_id").references(() => routines.id, {
      onDelete: "set null",
    }),
    // Calendar day in America/Sao_Paulo, computed by the app layer before insert.
    date: date("date", { mode: "string" }).notNull(),
    durationMinutes: integer("duration_minutes"),
    feeling: smallint("feeling"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("workouts_user_date_idx").on(table.userId, table.date),
    check(
      "workouts_feeling_range",
      sql`${table.feeling} is null or (${table.feeling} between 1 and 5)`,
    ),
  ],
);
