import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-svh bg-dashboard-surface text-slate-900 dark:text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-200/30 blur-[100px] dark:bg-blue-500/10" />
        <div className="absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-slate-200/40 blur-[100px] dark:bg-slate-600/10" />
      </div>
      <div className="relative flex min-h-svh w-full">
        <DashboardShell userEmail={user.email ?? ""}>
          {children}
        </DashboardShell>
      </div>
      <Toaster />
    </div>
  );
}
