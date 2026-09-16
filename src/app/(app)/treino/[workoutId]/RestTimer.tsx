"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/cn";
import { REST_SECONDS_DEFAULT, REST_SECONDS_MAX } from "@/lib/rest";

const EXTEND_SECONDS = 30;

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio not available (e.g. autoplay policy) — vibration below still fires.
  }
}

export type RestTimerHandle = { start: (seconds?: number) => void };

export function RestTimer({
  defaultSeconds = REST_SECONDS_DEFAULT,
  onExposeHandle,
}: {
  defaultSeconds?: number;
  onExposeHandle?: (handle: RestTimerHandle) => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [total, setTotal] = useState(defaultSeconds);

  // Reexpõe o handle quando o descanso padrão muda (o ajuste em
  // Perfil → Configurações revalida esta tela) — senão o `start()` ficaria
  // preso no valor da montagem.
  useEffect(() => {
    onExposeHandle?.({
      start: (seconds = defaultSeconds) => {
        setTotal(seconds);
        setSecondsLeft(seconds);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSeconds]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      playBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      const t = setTimeout(() => setSecondsLeft(null), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  if (secondsLeft === null) return null;

  const progress = 1 - Math.max(0, secondsLeft) / total;

  function extend() {
    setTotal((t) => Math.min(REST_SECONDS_MAX, t + EXTEND_SECONDS));
    setSecondsLeft((s) => (s === null ? null : Math.min(REST_SECONDS_MAX, s + EXTEND_SECONDS)));
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-space)+0.75rem)] z-30 flex justify-center px-4">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-lg bg-text px-4 py-3 text-bg shadow-lg animate-[toast-slide-in_0.25s_ease-out]">
        <span className="flex items-center gap-1.5 text-lg font-bold tabular-nums">
          {secondsLeft > 0 ? (
            `${secondsLeft}s`
          ) : (
            <>
              Vai! <Flame className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg/25">
          <div
            className={cn("h-full bg-accent transition-[width] duration-1000 ease-linear")}
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
        <button
          type="button"
          onClick={extend}
          className="text-sm font-medium underline underline-offset-2"
        >
          +{EXTEND_SECONDS}s
        </button>
        <button
          type="button"
          onClick={() => setSecondsLeft(null)}
          className="text-sm font-medium underline underline-offset-2"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
