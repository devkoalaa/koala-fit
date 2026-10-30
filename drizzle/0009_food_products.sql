CREATE TABLE "food_products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"serving_desc" text,
	"serving_g" numeric(6, 1),
	"kcal_100" numeric(5, 1) NOT NULL,
	"protein_100" numeric(4, 1) NOT NULL,
	"carbs_100" numeric(4, 1) NOT NULL,
	"fat_100" numeric(4, 1) NOT NULL,
	"fiber_100" numeric(4, 1),
	"sodium_100_mg" integer,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_products" ADD CONSTRAINT "food_products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_products_user_idx" ON "food_products" USING btree ("user_id");--> statement-breakpoint
-- O bot do Telegram cadastra e arquiva produtos com o usuário koala_fit_scale
-- (criado à mão no servidor; em dev não existe).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'koala_fit_scale') THEN
    GRANT SELECT, INSERT, UPDATE ON "food_products" TO koala_fit_scale;
  END IF;
END $$;
