"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/hoje", label: "Hoje", icon: "🏠" },
  { href: "/historico", label: "Histórico", icon: "📅" },
  { href: "/evolucao", label: "Evolução", icon: "📈" },
  { href: "/rotinas", label: "Rotinas", icon: "📋" },
  { href: "/perfil", label: "Perfil", icon: "🐨" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elevated"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                active ? "text-primary" : "text-text-tertiary",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-lg leading-none" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
