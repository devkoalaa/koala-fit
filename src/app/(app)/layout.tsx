import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ToastProvider } from "@/design-system/components/Toast";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col pt-[var(--safe-top)] pb-[calc(var(--bottom-nav-space)+1rem)]">
        {children}
      </div>
      <BottomNav />
    </ToastProvider>
  );
}
