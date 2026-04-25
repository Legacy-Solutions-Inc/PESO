import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminsOnlyView } from "@/components/admin/admins-only-view";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { getJobActivity, getJobPostingById } from "../../actions";
import { JobsComposeForm } from "../../_components/jobs-compose-form";
import type { JobStatus } from "@/lib/validations/job-posting";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_TONE: Record<JobStatus, string> = {
  draft: "bg-foreground/[0.05] text-muted-foreground ring-foreground/[0.06]",
  active: "bg-status-positive/10 text-status-positive ring-status-positive/20",
  closed: "bg-status-warning/10 text-status-warning ring-status-warning/25",
  archived: "bg-foreground/[0.04] text-muted-foreground/80 ring-foreground/[0.06]",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  draft: "Draft",
  active: "Active",
  closed: "Closed",
  archived: "Archived",
};

export default async function EditJobPostingPage({ params }: PageProps) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return <AdminsOnlyView reason={adminCheck.error} />;

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) notFound();

  const [postingResult, activityResult] = await Promise.all([
    getJobPostingById(numericId),
    getJobActivity(numericId),
  ]);

  if (postingResult.error === "Not found") notFound();
  if (!postingResult.data) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 pt-4">
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Could not load posting #{numericId}: {postingResult.error}
        </p>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/80 underline-offset-4 hover:underline"
        >
          ← Back to jobs
        </Link>
      </div>
    );
  }

  const job = postingResult.data;
  const activity = activityResult.data ?? [];

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
          <li className="font-medium text-foreground">Posting #{job.id}</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-tight text-foreground">
            Edit job posting
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_TONE[job.status]}`}
            >
              {STATUS_LABEL[job.status]}
            </span>
            <span data-tabular>Posting #{job.id}</span>
          </p>
        </div>
        {job.status === "active" ? (
          <Link
            href={`/jobs/${job.id}`}
            target="_blank"
            rel="noopener"
            className="text-[12.5px] font-medium text-foreground/80 underline-offset-4 hover:underline"
          >
            View public posting →
          </Link>
        ) : null}
      </header>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="activity">
            Activity{activity.length > 0 ? ` · ${activity.length}` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="compose" className="pt-6">
          <JobsComposeForm
            mode="edit"
            initial={{
              id: job.id,
              status: job.status,
              values: {
                title: job.title,
                employer_name: job.employer_name,
                description: job.description,
                location: job.location,
                employment_type: job.employment_type,
                salary_range_min: job.salary_range_min,
                salary_range_max: job.salary_range_max,
                application_deadline: job.application_deadline,
                contact_email: job.contact_email,
                contact_phone: job.contact_phone,
              },
            }}
          />
        </TabsContent>
        <TabsContent value="activity" className="pt-6">
          <ActivityFeed entries={activity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
