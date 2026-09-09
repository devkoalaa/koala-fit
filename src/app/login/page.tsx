import { redirect } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/design-system/components/Card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/hoje");

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Dumbbell className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text">Koala Fit</h1>
          <p className="text-sm text-text-secondary">Entre para registrar seu treino.</p>
        </div>
        <Card>
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
