"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { doseLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { APP_TIMEZONE } from "@/lib/date";

const doseSchema = z.object({
  doseMg: z.number().positive().max(50),
  // Hora local de São Paulo, como vem do <input type="datetime-local">.
  takenAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  notes: z.string().trim().max(500),
});

export async function createDoseLog(input: z.infer<typeof doseSchema>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const parsed = doseSchema.parse(input);

  // Aceita até 60 dias para trás e nada no futuro (com 5 min de folga).
  const ts = Date.parse(`${parsed.takenAt}:00-03:00`);
  const now = Date.now();
  if (!Number.isFinite(ts) || ts > now + 5 * 60_000 || ts < now - 60 * 86_400_000) {
    throw new Error("Data fora do esperado.");
  }

  const local = sql`${parsed.takenAt}::timestamp`;
  await db.insert(doseLogs).values({
    userId: user.id,
    takenAt: sql`${local} at time zone ${APP_TIMEZONE}`,
    date: sql`(${local})::date`,
    doseMg: parsed.doseMg.toString(),
    notes: parsed.notes || null,
  });
  revalidatePath("/evolucao/registro");
}

export async function deleteDoseLog(doseId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = z.uuid().parse(doseId);

  await db.delete(doseLogs).where(and(eq(doseLogs.id, id), eq(doseLogs.userId, user.id)));
  revalidatePath("/evolucao/registro");
}
