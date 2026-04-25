import Link from "next/link";
import { Briefcase, ChevronRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminsOnlyView } from "@/components/admin/admins-only-view";
import { Button } from "@/components/ui/button";
import { listJobPostings } from "./actions";
import { JobsFilters } from "./_components/jobs-filters";
import { JobRowActions } from "./_components/jobs-row-actions";
import {
  jobStatusSchema,
  type JobStatus,
} from "@/lib/validations/job-posting";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    within?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;
const ALLOWED_DEADLINE_WINDOWS = [7, 14, 30, 60, 90] as const;

function parseStatus(raw: string | undefined): JobStatus | "all" {
  if (raw === "all" || raw === undefined) return "all";
  const parsed = jobStatusSchema.safeParse(raw);
  return parsed.success ? parsed.data : "all";
}

function parseWindow(raw: string | undefined): number | undefined {
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return (ALLOWED_DEADLINE_WINDOWS as readonly number[]).includes(n)
    ? n
    : undefined;
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
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

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export default async function AdminJobsListPage({ searchParams }: PageProps) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return <AdminsOnlyView reason={adminCheck.error} />;

  const params = await searchParams;
  const status = parseStatus(params.status);
  const within = parseWindow(params.within);
  const page = parsePage(params.page);

  const result = await listJobPostings({
    status,
    deadlineWithinDays: within,
    page,
    pageSize: PAGE_SIZE,
  });
  if (!result.data) {
    return (
      <div className="space-y-6 pt-4">
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {result.error}
        </p>
      </div>
    );
  }

  const { jobs, total, totalPages } = result.data;

  return (
    <div className="space-y-8 pb-12">
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
          <li className="font-medium text-foreground">Job postings</li>
        </ol>
      </nav>

      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-tight text-foreground">
            Job postings
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
            PESO-curated postings. Visitors apply in person at the Municipal
            Hall — no application flow exists in-app.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/jobs/new" className="gap-2">
            <Plus className="size-4" aria-hidden />
            New posting
          </Link>
        </Button>
      </header>

      <JobsFilters status={status} within={within} />

      <section
        className="overflow-hidden rounded-lg border border-border bg-card"
        aria-label="Job postings"
      >
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-foreground/[0.04] text-muted-foreground">
              <Briefcase className="size-4" aria-hidden />
            </span>
            <p className="text-[14px] font-medium text-foreground">
              No postings match the current filter.
            </p>
            <p className="text-[13px] text-muted-foreground">
              Adjust the filter or create a new posting.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_TONE[job.status]}`}
                    >
                      {STATUS_LABEL[job.status]}
                    </span>
                    <span className="rounded-full bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-inset ring-foreground/[0.06]">
                      {EMPLOYMENT_TYPE_LABEL[job.employment_type] ??
                        job.employment_type}
                    </span>
                    <span
                      data-tabular
                      className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      Posting #{job.id}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] font-medium text-foreground">
                    {job.title}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {job.employer_name} · {job.location}
                  </p>
                  <p
                    data-tabular
                    className="mt-1 text-[12px] text-muted-foreground"
                  >
                    Apply by {formatDate(job.application_deadline)}
                  </p>
                </div>
                <JobRowActions id={job.id} status={job.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {totalPages > 1 ? (
        <Paginator
          status={status}
          within={within}
          page={page}
          totalPages={totalPages}
          total={total}
        />
      ) : null}
    </div>
  );
}

function Paginator({
  status,
  within,
  page,
  totalPages,
  total,
}: {
  status: JobStatus | "all";
  within: number | undefined;
  page: number;
  totalPages: number;
  total: number;
}) {
  const buildHref = (p: number) => {
    const search = new URLSearchParams({ status, page: String(p) });
    if (within !== undefined) search.set("within", String(within));
    return `/admin/jobs?${search.toString()}`;
  };
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  return (
    <div className="flex flex-col gap-3 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p data-tabular>
        Page {page} of {totalPages} · {total} posting{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={buildHref(prev)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground/60">
            Previous
          </span>
        )}
        {next ? (
          <Link
            href={buildHref(next)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground/60">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
