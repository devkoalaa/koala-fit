CREATE TABLE "food_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"eaten_at" timestamp with time zone NOT NULL,
	"date" date NOT NULL,
	"meal" text,
	"description" text NOT NULL,
	"quantity" text,
	"kcal" integer NOT NULL,
	"protein_g" numeric(5, 1),
	"carbs_g" numeric(5, 1),
	"fat_g" numeric(5, 1),
	"fiber_g" numeric(4, 1),
	"water_ml" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_logs_user_date_idx" ON "food_logs" USING btree ("user_id","date");