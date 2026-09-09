"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth loading={pending} size="lg">
      Entrar
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="username"
        inputMode="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Senha"
        autoComplete="current-password"
        required
      />
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
