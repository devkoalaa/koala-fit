import { pgTable, uuid, integer, date, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const streakState = pgTable(
  "streak_state",
  {
    // 1:1 with users
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastValidDate: date("last_valid_date", { mode: "string" }),
    streakProtectorsAvailable: integer("streak_protectors_available")
      .notNull()
      .default(0),
    // Complete (no miss, no protector used) scheduled weeks accumulated since
    // the last protector was awarded. Hits 2 -> awards a protector, resets to 0.
    weeksTowardProtector: integer("weeks_toward_protector").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "streak_protectors_cap",
      sql`${table.streakProtectorsAvailable} between 0 and 2`,
    ),
    check(
      "weeks_toward_protector_range",
      sql`${table.weeksTowardProtector} between 0 and 1`,
    ),
  ],
);
