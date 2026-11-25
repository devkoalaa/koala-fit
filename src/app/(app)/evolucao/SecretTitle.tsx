"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

const TAPS = 5;
const WINDOW_MS = 3_000;

/**
 * Título da Evolução. Cinco toques seguidos (em até 3 s) abrem a tela de
 * doses, que não tem link em lugar nenhum. Sem nenhum retorno visual.
 */
export function SecretTitle() {
  const router = useRouter();
  const taps = useRef<number[]>([]);

  function onTap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < WINDOW_MS), now];
    if (taps.current.length >= TAPS) {
      taps.current = [];
      router.push("/evolucao/registro");
    }
  }

  return (
    <h1 className="select-none text-2xl font-bold text-text" onClick={onTap}>
      Evolução
    </h1>
  );
}
