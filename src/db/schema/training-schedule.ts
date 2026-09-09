import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { weekdayEnum } from "./enums";

// One row per (user, weekday) that is scheduled for training. Absence of a row = not scheduled.
export const trainingSchedule = pgTable(
  "training_schedule",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekday: weekdayEnum("weekday").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("training_schedule_user_weekday_unique").on(
      table.userId,
      table.weekday,
    ),
  ],
);
