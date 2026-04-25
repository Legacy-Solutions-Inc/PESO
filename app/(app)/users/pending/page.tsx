import { redirect } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { signOut } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

function formatSubmissionTime(isoString: string | undefined): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default async function PendingApprovalPage() {
  const { data } = await getUserProfile();

  if (!data || data.profile.status !== "pending") {
    redirect("/dashboard");
  }

  const submittedAt = formatSubmissionTime(data.profile.created_at);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <main className="w-full max-w-md">
        <section
          aria-labelledby="pending-heading"
          className="rounded-lg border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-status-warning/10 text-status-warning">
              <Clock className="h-6 w-6" aria-hidden />
            </div>
            <h1
              id="pending-heading"
              className="text-2xl font-medium tracking-tight text-foreground"
            >
              Account pending approval
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account request has been submitted and is waiting for an administrator.
            </p>
          </div>

          <div className="space-y-5 p-8">
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-right font-medium text-foreground">
                  {data.user.email}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="text-right text-foreground">{submittedAt}</dd>
              </div>
            </dl>

            <p className="text-sm text-muted-foreground">
              Approval usually takes 1&ndash;2 business days. If you have not been approved after that, contact your administrator directly.
            </p>

            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="w-full gap-2"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </form>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Department of Labor and Employment &middot; National Skills Registration Program
        </p>
      </main>
    </div>
  );
}
