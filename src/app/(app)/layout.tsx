import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ToastProvider } from "@/design-system/components/Toast";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <ToastProvider>
      {/*
        The status bar is black-translucent, so scrolled content otherwise
        shows through it blurred. An opaque band in the page background hides
        it cleanly — it sits above content but below the nav and any sheet.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 bg-bg"
        style={{ height: "var(--safe-top)" }}
      />
      <div className="mx-auto flex min-h-lvh w-full max-w-md flex-1 flex-col pt-[var(--safe-top)] pb-[calc(var(--bottom-nav-space)+1rem)]">
        <PageTransition>{children}</PageTransition>
      </div>
      <BottomNav />
    </ToastProvider>
  );
}
