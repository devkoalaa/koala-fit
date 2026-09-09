import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { muscleGroupEnum, exerciseTypeEnum } from "./enums";

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // NULL = global catalog exercise (seeded, shared by everyone). Set = user's custom exercise.
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    muscleGroup: muscleGroupEnum("muscle_group").notNull(),
    type: exerciseTypeEnum("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("exercises_system_name_unique")
      .on(table.name)
      .where(sql`${table.userId} is null`),
    uniqueIndex("exercises_user_name_unique").on(table.userId, table.name),
  ],
);
