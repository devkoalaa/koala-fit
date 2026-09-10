"use client";

import { usePathname } from "next/navigation";

/**
 * Fades/slides each route's content in on navigation. Keyed by pathname so
 * React remounts (and thus replays the animation on) every route change,
 * not just the first mount.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="flex flex-1 flex-col animate-[page-fade-in_0.22s_ease-out]">
      {children}
    </div>
  );
}
