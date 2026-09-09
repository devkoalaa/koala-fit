"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { routines, workouts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { toISODate } from "@/lib/date";

export async function startWorkout(routineId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, user.id)))
    .limit(1);
  if (!owned) throw new Error("Rotina não encontrada.");

  const date = toISODate();

  // Avoid duplicate rows if the button is tapped twice or the user comes back mid-workout.
  const [existing] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.userId, user.id), eq(workouts.date, date)))
    .limit(1);
  if (existing) redirect(`/treino/${existing.id}`);

  const [workout] = await db.insert(workouts).values({ userId: user.id, routineId, date }).returning();
  redirect(`/treino/${workout.id}`);
}
