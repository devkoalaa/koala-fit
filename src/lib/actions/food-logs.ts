"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { foodLogs, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function deleteFoodLog(logId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = z.uuid().parse(logId);

  await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, user.id)));
  revalidatePath("/alimentacao");
}

const goal = (max: number) => z.number().int().min(0).max(max).nullable();

const goalsSchema = z.object({
  kcalGoal: goal(6000),
  proteinGoalG: goal(400),
  carbsGoalG: goal(800),
  fatGoalG: goal(300),
  fiberGoalG: goal(100),
  waterGoalMl: goal(8000),
});

export async function updateNutritionGoals(input: z.infer<typeof goalsSchema>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = goalsSchema.parse(input);

  await db
    .update(users)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/alimentacao");
}
