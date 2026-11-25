CREATE TABLE "dose_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"taken_at" timestamp with time zone NOT NULL,
	"date" date NOT NULL,
	"dose_mg" numeric(5, 2) NOT NULL,
	"notes" text,
	"telegram_message_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dose_logs" ADD CONSTRAINT "dose_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dose_logs_user_taken_idx" ON "dose_logs" USING btree ("user_id","taken_at");--> statement-breakpoint
-- O bot do Telegram registra e desfaz doses com o usuário koala_fit_scale
-- (criado à mão no servidor; em dev não existe).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'koala_fit_scale') THEN
    GRANT SELECT, INSERT, DELETE ON "dose_logs" TO koala_fit_scale;
  END IF;
END $$;
