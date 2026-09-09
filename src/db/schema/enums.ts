import { pgEnum } from "drizzle-orm/pg-core";

export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

export const muscleGroupEnum = pgEnum("muscle_group", [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "legs",
  "glutes",
  "calves",
  "abs",
  "cardio",
  "full_body",
  "other",
]);

export const exerciseTypeEnum = pgEnum("exercise_type", ["weight", "cardio"]);

export const weekdayEnum = pgEnum("weekday", [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
]);
