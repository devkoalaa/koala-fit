ALTER TABLE "users" ADD COLUMN "kcal_goal" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "protein_goal_g" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "carbs_goal_g" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fat_goal_g" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fiber_goal_g" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "water_goal_ml" integer;--> statement-breakpoint
ALTER TABLE "food_logs" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
-- O bot do Telegram grava o diário alimentar com o mesmo usuário que grava os
-- relatórios da balança (koala_fit_scale, criado à mão no servidor; em dev não
-- existe). DELETE é para o botão Desfazer.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'koala_fit_scale') THEN
    GRANT SELECT, INSERT, DELETE ON "food_logs" TO koala_fit_scale;
  END IF;
END $$;
