"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const HOLD_MS = 550;
const FADE_MS = 300;

/**
 * In-app splash shown on cold start (mounted once in the root layout, so it
 * doesn't reappear on client-side navigations). iOS's native
 * apple-touch-startup-image support turned out to be unreliable in practice
 * (confirmed correct tags/images, still not picked up on a real device) —
 * this is fully in our control instead, at the cost of not covering the
 * very first native-launch instant before any of our JS runs.
 */
export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), HOLD_MS);
    const removeTimer = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-bg transition-opacity ease-out",
        fading ? "opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-5xl">
        🐨
      </div>
    </div>
  );
}
