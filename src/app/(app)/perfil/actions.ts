"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, trainingSchedule } from "@/db/schema";
import { weekdayEnum } from "@/db/schema/enums";
import { getCurrentUser } from "@/lib/auth/session";
import { THEME_COOKIE } from "@/lib/theme";
import { REST_SECONDS_MAX, REST_SECONDS_MIN } from "@/lib/rest";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

const profileSchema = z.object({
  heightCm: z.number().int().positive().max(280).nullable(),
  weeklyGoal: z.number().int().min(0).max(14),
  restSeconds: z.number().int().min(REST_SECONDS_MIN).max(REST_SECONDS_MAX),
  theme: z.enum(["light", "dark", "system"]),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const user = await requireUser();
  const parsed = profileSchema.parse(input);

  await db
    .update(users)
    .set({
      heightCm: parsed.heightCm,
      weeklyGoal: parsed.weeklyGoal,
      restSeconds: parsed.restSeconds,
      theme: parsed.theme,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, parsed.theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
}

const weekdaySchema = z.enum(weekdayEnum.enumValues);

export async function updateTrainingSchedule(weekdays: string[]) {
  const user = await requireUser();
  const parsed = z.array(weekdaySchema).parse(weekdays);

  await db.delete(trainingSchedule).where(eq(trainingSchedule.userId, user.id));
  if (parsed.length > 0) {
    await db.insert(trainingSchedule).values(parsed.map((weekday) => ({ userId: user.id, weekday })));
  }

  revalidatePath("/perfil");
  revalidatePath("/hoje");
  revalidatePath("/evolucao");
}
