CREATE TABLE "body_composition_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 2) NOT NULL,
	"bmi" numeric(4, 1),
	"body_fat_pct" numeric(4, 1),
	"fat_mass_kg" numeric(5, 2),
	"lean_mass_kg" numeric(5, 2),
	"muscle_mass_kg" numeric(5, 2),
	"muscle_pct" numeric(4, 1),
	"skeletal_muscle_kg" numeric(5, 2),
	"skeletal_muscle_pct" numeric(4, 1),
	"bone_mass_kg" numeric(4, 2),
	"water_pct" numeric(4, 1),
	"water_kg" numeric(5, 2),
	"protein_pct" numeric(4, 1),
	"visceral_fat" numeric(4, 1),
	"bmr_kcal" integer,
	"body_age" integer,
	"score" integer,
	"source" text DEFAULT 'okok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "body_composition_logs" ADD CONSTRAINT "body_composition_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "body_composition_logs_user_measured_at_unique" ON "body_composition_logs" USING btree ("user_id","measured_at");--> statement-breakpoint
-- Em produção o bot do Telegram grava os relatórios com um usuário próprio
-- (koala_fit_scale), criado à mão no servidor; em dev ele não existe.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'koala_fit_scale') THEN
    GRANT SELECT, INSERT, UPDATE ON "body_composition_logs" TO koala_fit_scale;
  END IF;
END $$;
