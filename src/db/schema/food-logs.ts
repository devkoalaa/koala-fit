import {
  pgTable,
  uuid,
  date,
  integer,
  numeric,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Diário alimentar: cada item que o usuário relata ter comido ou bebido, com a
// estimativa de calorias e macros. Por enquanto é gravado direto no banco pelo
// Claude a partir da conversa; o app ainda não tem tela para isso.
export const foodLogs = pgTable(
  "food_logs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eatenAt: timestamp("eaten_at", { withTimezone: true }).notNull(),
    // Dia de eatenAt em America/Sao_Paulo.
    date: date("date", { mode: "string" }).notNull(),
    // Café da manhã, almoço, lanche, jantar, ceia...
    meal: text("meal"),
    // O que foi comido, como relatado ("2 ovos mexidos").
    description: text("description").notNull(),
    // Quantidade usada no cálculo ("100 g", "1 unidade média").
    quantity: text("quantity"),
    kcal: integer("kcal").notNull(),
    proteinG: numeric("protein_g", { precision: 5, scale: 1 }),
    carbsG: numeric("carbs_g", { precision: 5, scale: 1 }),
    fatG: numeric("fat_g", { precision: 5, scale: 1 }),
    fiberG: numeric("fiber_g", { precision: 4, scale: 1 }),
    // Água e bebidas sem caloria também entram, para somar a hidratação.
    waterMl: integer("water_ml"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("food_logs_user_date_idx").on(table.userId, table.date)],
);
