"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { checkLoginRateLimit, getClientIp } from "@/lib/auth/rate-limit";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Informe email e senha válidos." };
  }

  const ip = await getClientIp();
  const rateLimit = checkLoginRateLimit(`login:${ip}`);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60);
    return { error: `Muitas tentativas. Tente novamente em ${minutes} min.` };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Email ou senha incorretos." };
  }

  await createSession(user.id);
  redirect("/hoje");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
