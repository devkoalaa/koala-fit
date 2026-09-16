ALTER TABLE "users" ADD COLUMN "rest_seconds" integer DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE "cardio_sessions" ADD COLUMN "entry_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
-- Linhas antigas ficam todas com entry_number = 1; numera as que já existirem
-- em duplicata (mesmo treino + exercício) antes do índice único.
UPDATE "cardio_sessions" AS "c"
SET "entry_number" = "numbered"."rn"
FROM (
  SELECT "id", row_number() OVER (
    PARTITION BY "workout_id", "exercise_id" ORDER BY "created_at", "id"
  ) AS "rn"
  FROM "cardio_sessions"
) AS "numbered"
WHERE "c"."id" = "numbered"."id" AND "c"."entry_number" <> "numbered"."rn";--> statement-breakpoint
CREATE UNIQUE INDEX "cardio_sessions_workout_exercise_entry_unique" ON "cardio_sessions" USING btree ("workout_id","exercise_id","entry_number");