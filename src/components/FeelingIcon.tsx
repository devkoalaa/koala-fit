import { Frown, Annoyed, Meh, Smile, Laugh, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const FEELING_ICONS: Record<number, LucideIcon> = {
  1: Frown,
  2: Annoyed,
  3: Meh,
  4: Smile,
  5: Laugh,
};

export function FeelingIcon({ feeling, className }: { feeling: number; className?: string }) {
  const Icon = FEELING_ICONS[feeling];
  if (!Icon) return null;
  return <Icon className={cn("h-5 w-5", className)} strokeWidth={2} aria-hidden="true" />;
}
