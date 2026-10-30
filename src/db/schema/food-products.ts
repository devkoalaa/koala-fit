import { pgTable, uuid, integer, numeric, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Produtos que o usuário tem em casa, com os números do rótulo. O bot do
// Telegram cadastra a partir da foto da tabela nutricional e passa a lista ativa
// para o Claude, que usa esses valores em vez de estimar quando o produto é
// citado. Ao cadastrar outro produto da mesma categoria (trocou a marca do
// iogurte), o anterior é arquivado.
export const foodProducts = pgTable(
  "food_products",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nome com marca, como aparece nas respostas ("Iogurte Nestlé batido zero").
    name: text("name").notNull(),
    // Tipo genérico, para "iogurte" achar o iogurte da vez e para a troca de marca.
    category: text("category").notNull(),
    // Porção do rótulo ("1 copo (200 g)") e o peso dela em g ou ml.
    servingDesc: text("serving_desc"),
    servingG: numeric("serving_g", { precision: 6, scale: 1 }),
    // Valores por 100 g (ou 100 ml), como na coluna "100 g" da tabela.
    kcal100: numeric("kcal_100", { precision: 5, scale: 1 }).notNull(),
    protein100: numeric("protein_100", { precision: 4, scale: 1 }).notNull(),
    carbs100: numeric("carbs_100", { precision: 4, scale: 1 }).notNull(),
    fat100: numeric("fat_100", { precision: 4, scale: 1 }).notNull(),
    fiber100: numeric("fiber_100", { precision: 4, scale: 1 }),
    sodium100Mg: integer("sodium_100_mg"),
    // Preenchido quando acabou ou foi trocado por outra marca.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("food_products_user_idx").on(table.userId)],
);
