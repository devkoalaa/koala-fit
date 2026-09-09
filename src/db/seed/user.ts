// Creates (or resets the password of) the single account owner.
// No public sign-up screen — this is how the one user gets into the system.
//
// Usage:
//   pnpm seed:user
//   pnpm seed:user -- --email you@example.com --password "..." --name "Herbert" --height 180
//
// Any flag omitted is prompted for interactively.

import { createInterface } from "node:readline/promises";
import { z } from "zod";
import { db } from "../client";
import { users, streakState } from "../schema";
import { hashPassword } from "@/lib/auth/password";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function prompt(rl: ReturnType<typeof createInterface>, question: string) {
  const answer = await rl.question(question);
  return answer.trim();
}

const inputSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  name: z.string().optional(),
  heightCm: z.number().int().positive().optional(),
});

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const email = getArg("--email") ?? (await prompt(rl, "Email: "));
    const password = getArg("--password") ?? (await prompt(rl, "Senha (min. 8 caracteres): "));
    const name = getArg("--name") ?? ((await prompt(rl, "Nome (opcional): ")) || undefined);
    const heightRaw = getArg("--height") ?? (await prompt(rl, "Altura em cm (opcional): "));
    const heightCm = heightRaw ? Number(heightRaw) : undefined;

    const parsed = inputSchema.safeParse({ email, password, name, heightCm });
    if (!parsed.success) {
      console.error("Entrada inválida:", parsed.error.issues.map((i) => i.message).join(" "));
      process.exit(1);
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const [user] = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        passwordHash,
        name: parsed.data.name,
        heightCm: parsed.data.heightCm,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { passwordHash, name: parsed.data.name, heightCm: parsed.data.heightCm },
      })
      .returning();

    await db
      .insert(streakState)
      .values({ userId: user.id })
      .onConflictDoNothing({ target: streakState.userId });

    console.log(`\nUsuário pronto: ${user.email} (id: ${user.id})`);
  } finally {
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Falha ao criar usuário:", error);
    process.exit(1);
  });
