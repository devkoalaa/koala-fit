import { pgTable, uuid, date, integer, numeric, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Doses semanais registradas pelo comando /dose do bot do Telegram, que não
// aparece no menu, e vistas numa tela do app sem link (5 toques no título da
// Evolução). É discreto de propósito: nada aqui diz do que se trata.
export const doseLogs = pgTable(
  "dose_logs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    takenAt: timestamp("taken_at", { withTimezone: true }).notNull(),
    // Dia de takenAt em America/Sao_Paulo.
    date: date("date", { mode: "string" }).notNull(),
    doseMg: numeric("dose_mg", { precision: 5, scale: 2 }).notNull(),
    // O resto da mensagem: local, efeitos, observações.
    notes: text("notes"),
    // Mensagem do Telegram que registrou (o Desfazer apaga por ela).
    telegramMessageId: integer("telegram_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("dose_logs_user_taken_idx").on(table.userId, table.takenAt)],
);
