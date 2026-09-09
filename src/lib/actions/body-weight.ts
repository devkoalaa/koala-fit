"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { bodyWeightLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { toISODate } from "@/lib/date";

const weightSchema = z.number().positive().max(500);

export async function logBodyWeight(weightKg: number) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = weightSchema.parse(weightKg);
  const date = toISODate();

  await db
    .insert(bodyWeightLogs)
    .values({ userId: user.id, date, weightKg: parsed.toString() })
    .onConflictDoUpdate({
      target: [bodyWeightLogs.userId, bodyWeightLogs.date],
      set: { weightKg: parsed.toString() },
    });

  revalidatePath("/hoje");
  revalidatePath("/evolucao");
}

export async function deleteBodyWeightLog(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db.delete(bodyWeightLogs).where(and(eq(bodyWeightLogs.id, id), eq(bodyWeightLogs.userId, user.id)));
  revalidatePath("/evolucao");
}
