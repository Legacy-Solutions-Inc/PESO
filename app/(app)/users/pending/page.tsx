import { redirect } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { signOut } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export default async function PendingApprovalPage() {
  const { data } = await getUserProfile();

  // If no profile or not pending, redirect to home
  if (!data || data.profile.status !== "pending") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/80 p-4 dark:bg-slate-950/50">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-700/50 dark:bg-slate-900/50 dark:shadow-none">
          <div className="relative bg-linear-to-br from-amber-50 to-orange-50 px-8 py-12 text-center dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-lg dark:bg-amber-900/30">
                <Clock className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Account Pending Approval
              </h1>
            </div>
          </div>

          <div className="space-y-6 px-8 py-8">
            <div className="space-y-3 text-center">
              <p className="text-base text-slate-600 dark:text-slate-300">
                Your account has been created successfully and is currently awaiting approval from an administrator.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You will receive access to the system once an admin activates your account. This usually takes 1-2 business days.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Email:</span> {data.user.email}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <form action={signOut} className="w-full">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-slate-200 bg-white font-medium shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </form>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                If you have any questions, please contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
