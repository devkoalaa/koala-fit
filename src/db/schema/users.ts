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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
