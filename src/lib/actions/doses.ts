"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { doseLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function deleteDoseLog(doseId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = z.uuid().parse(doseId);

  await db.delete(doseLogs).where(and(eq(doseLogs.id, id), eq(doseLogs.userId, user.id)));
  revalidatePath("/evolucao/registro");
}
