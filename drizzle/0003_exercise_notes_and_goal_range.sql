ALTER TABLE "users" ADD COLUMN "weekly_goal_max" integer;--> statement-breakpoint
ALTER TABLE "routine_exercises" ADD COLUMN "notes" text;--> statement-breakpoint
-- Dados do plano de treino A/B. Só insere/atualiza catálogo, rotinas e meta:
-- treinos, séries e cardio já registrados não são tocados.
--
-- Catálogo: cria como exercício global cada nome que ainda não existe — a não
-- ser que todo usuário já tenha um exercício próprio com esse nome.
INSERT INTO "exercises" ("id", "name", "muscle_group", "type")
SELECT gen_random_uuid(), "v"."name", "v"."muscle_group"::"muscle_group", "v"."type"::"exercise_type"
FROM (VALUES
  ('Leg press 45', 'legs', 'weight'),
  ('Leg press horizontal', 'legs', 'weight'),
  ('Mesa flexora', 'legs', 'weight'),
  ('Glúteo máquina', 'glutes', 'weight'),
  ('Cadeira abdutora', 'legs', 'weight'),
  ('Cadeira adutora', 'legs', 'weight'),
  ('Supino reto com barra', 'chest', 'weight'),
  ('Supino inclinado (halteres)', 'chest', 'weight'),
  ('Puxada alta', 'back', 'weight'),
  ('Remada máquina', 'back', 'weight'),
  ('Remada baixa', 'back', 'weight'),
  ('Crucifixo', 'chest', 'weight'),
  ('Elevação lateral (halteres)', 'shoulders', 'weight'),
  ('Bíceps scott', 'biceps', 'weight'),
  ('Tríceps na puxada alta (corda)', 'triceps', 'weight'),
  ('Paralela abdominal', 'abs', 'weight'),
  ('Agachamento no Smith', 'legs', 'weight'),
  ('Esteira', 'cardio', 'cardio')
) AS "v"("name", "muscle_group", "type")
WHERE NOT EXISTS (
  SELECT 1 FROM "exercises" "e" WHERE "e"."name" = "v"."name" AND "e"."user_id" IS NULL
)
AND (
  NOT EXISTS (SELECT 1 FROM "users")
  OR EXISTS (
    SELECT 1 FROM "users" "u"
    WHERE NOT EXISTS (
      SELECT 1 FROM "exercises" "c" WHERE "c"."user_id" = "u"."id" AND "c"."name" = "v"."name"
    )
  )
);--> statement-breakpoint
-- Rotinas: cria "Treino A" e "Treino B" para quem ainda não tem. B nasce 1 ms
-- depois de A para a rotação (ordem de criação) alternar A → B.
INSERT INTO "routines" ("id", "user_id", "name", "created_at", "updated_at")
SELECT gen_random_uuid(), "u"."id", "r"."name", now() + "r"."ord" * interval '1 millisecond', now()
FROM "users" "u"
CROSS JOIN (VALUES ('Treino A', 0), ('Treino B', 1)) AS "r"("name", "ord")
WHERE NOT EXISTS (
  SELECT 1 FROM "routines" "x" WHERE "x"."user_id" = "u"."id" AND "x"."name" = "r"."name"
);--> statement-breakpoint
-- Se já existiam rotinas com esses nomes, troca só a lista de exercícios
-- (o template). Os treinos feitos com elas continuam ligados à mesma rotina.
DELETE FROM "routine_exercises"
WHERE "routine_id" IN (SELECT "id" FROM "routines" WHERE "name" IN ('Treino A', 'Treino B'));--> statement-breakpoint
INSERT INTO "routine_exercises" (
  "id", "routine_id", "exercise_id", "position", "target_sets",
  "target_reps_min", "target_reps_max", "target_duration_seconds", "notes"
)
SELECT gen_random_uuid(), "r"."id", "ex"."id", "p"."position", "p"."sets", "p"."reps_min", "p"."reps_max", "p"."duration_seconds", "p"."notes"
FROM "routines" "r"
JOIN (VALUES
  ('Treino A', 1, 'Leg press 45', 3, 10, 15, NULL::integer, NULL::text),
  ('Treino A', 2, 'Mesa flexora', 3, 10, 15, NULL, NULL),
  ('Treino A', 3, 'Supino reto com barra', 3, 10, 15, NULL, NULL),
  ('Treino A', 4, 'Puxada alta', 3, 10, 15, NULL, NULL),
  ('Treino A', 5, 'Remada máquina', 2, 10, 15, NULL, NULL),
  ('Treino A', 6, 'Elevação lateral (halteres)', 2, 12, 15, NULL, NULL),
  ('Treino A', 7, 'Paralela abdominal', 3, 8, 12, NULL, 'Joelhos dobrados'),
  ('Treino A', 8, 'Esteira', 1, NULL, NULL, 900, '15–20 min'),
  ('Treino B', 1, 'Leg press horizontal', 3, 10, 15, NULL, NULL),
  ('Treino B', 2, 'Glúteo máquina', 3, 10, 15, NULL, NULL),
  ('Treino B', 3, 'Cadeira abdutora', 2, 12, 15, NULL, NULL),
  ('Treino B', 4, 'Supino inclinado (halteres)', 3, 10, 15, NULL, NULL),
  ('Treino B', 5, 'Remada baixa', 3, 10, 15, NULL, NULL),
  ('Treino B', 6, 'Crucifixo', 2, 12, 15, NULL, NULL),
  ('Treino B', 7, 'Bíceps scott', 2, 10, 15, NULL, NULL),
  ('Treino B', 8, 'Tríceps na puxada alta (corda)', 2, 10, 15, NULL, NULL),
  ('Treino B', 9, 'Esteira', 1, NULL, NULL, 900, '15–20 min')
) AS "p"("routine_name", "position", "exercise_name", "sets", "reps_min", "reps_max", "duration_seconds", "notes")
  ON "p"."routine_name" = "r"."name"
-- Prefere o exercício próprio do usuário com o mesmo nome; senão, o global.
CROSS JOIN LATERAL (
  SELECT "e"."id" FROM "exercises" "e"
  WHERE "e"."name" = "p"."exercise_name" AND ("e"."user_id" = "r"."user_id" OR "e"."user_id" IS NULL)
  ORDER BY "e"."user_id" NULLS LAST
  LIMIT 1
) AS "ex";--> statement-breakpoint
-- Frequência: 2 a 3 treinos por semana, alternando A e B.
UPDATE "users" SET "weekly_goal" = 2, "weekly_goal_max" = 3, "updated_at" = now();
