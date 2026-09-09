"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/design-system/components/Sheet";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { createRoutine } from "./actions";

export function NewRoutineSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button onClick={() => setOpen(true)} fullWidth size="lg">
        + Nova rotina
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Nova rotina">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => createRoutine(name));
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Treino A"
            autoFocus
            required
          />
          <Button type="submit" fullWidth loading={pending}>
            Criar
          </Button>
        </form>
      </Sheet>
    </>
  );
}
