import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminsOnlyView } from "@/components/admin/admins-only-view";
import { JobsComposeForm } from "../_components/jobs-compose-form";

export default async function NewJobPostingPage() {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return <AdminsOnlyView reason={adminCheck.error} />;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-12">
      <nav aria-label="Breadcrumb" className="pt-2">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <li>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li>
            <Link href="/admin/jobs" className="transition-colors hover:text-foreground">
              Jobs
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li className="font-medium text-foreground">New posting</li>
        </ol>
      </nav>

      <header>
        <h1 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-tight text-foreground">
          New job posting
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          The posting starts as a draft. Activate it to make it visible at /jobs.
        </p>
      </header>

      <JobsComposeForm mode="new" />
    </div>
  );
}
