"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { REST_SECONDS_MAX, REST_SECONDS_MIN } from "@/lib/rest";

// Um arquivo "use server" só pode exportar funções async, então o schema fica
// local — as bordas vêm de @/lib/rest, compartilhadas com a tela.
const restSecondsSchema = z.number().int().min(REST_SECONDS_MIN).max(REST_SECONDS_MAX);

export async function updateRestSeconds(seconds: number) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const restSeconds = restSecondsSchema.parse(seconds);

  await db.update(users).set({ restSeconds, updatedAt: new Date() }).where(eq(users.id, user.id));

  revalidatePath("/perfil/configuracoes");
}
