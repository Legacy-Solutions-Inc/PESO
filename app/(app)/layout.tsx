import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getNotificationSummary } from "@/app/(app)/notifications/actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const { data, error } = await getUserProfile();

  if (error || !data) {
    redirect("/login");
  }

  const summaryResult = await getNotificationSummary();
  const notificationSummary =
    summaryResult.data ?? { pendingUserCount: 0 };

  return (
    <div className="relative flex min-h-dvh bg-background text-foreground">
      <div className="relative flex min-h-dvh w-full">
        <DashboardShell
          userEmail={data.user.email}
          userRole={data.profile.role}
          notificationSummary={notificationSummary}
        >
          {children}
        </DashboardShell>
      </div>
      <Toaster />
    </div>
  );
}
