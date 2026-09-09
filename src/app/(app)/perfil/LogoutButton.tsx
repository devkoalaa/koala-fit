"use client";

import { useTransition } from "react";
import { Button } from "@/design-system/components/Button";
import { logoutAction } from "@/app/login/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      fullWidth
      loading={pending}
      onClick={() => startTransition(() => logoutAction())}
    >
      Sair
    </Button>
  );
}
