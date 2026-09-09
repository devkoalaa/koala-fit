"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, TrendingUp, ClipboardList, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/hoje", label: "Hoje", Icon: Home },
  { href: "/historico", label: "Histórico", Icon: Calendar },
  { href: "/evolucao", label: "Evolução", Icon: TrendingUp },
  { href: "/rotinas", label: "Rotinas", Icon: ClipboardList },
  { href: "/perfil", label: "Perfil", Icon: CircleUserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elevated pb-[var(--bottom-nav-inset)] pl-[var(--safe-left)] pr-[var(--safe-right)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                active ? "text-primary" : "text-text-tertiary",
              )}
              aria-current={active ? "page" : undefined}
            >
              <tab.Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
