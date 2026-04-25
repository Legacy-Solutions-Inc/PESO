import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { JobRow } from "@/components/public/job-row";
import { listPublicJobsPaginated } from "../_data/queries";
import {
  employmentTypeSchema,
  type EmploymentType,
} from "@/lib/validations/job-posting";

export const metadata: Metadata = {
  title: "Job postings — PESO Lambunao",
  description:
    "Active job postings curated by PESO Lambunao staff. Apply in person at the PESO office.",
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    location?: string;
    within?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;
const ALLOWED_WINDOWS = [7, 14, 30, 60, 90] as const;

function parseType(raw: string | undefined): EmploymentType | undefined {
  const r = employmentTypeSchema.safeParse(raw);
  return r.success ? r.data : undefined;
}
function parseWindow(raw: string | undefined): number | undefined {
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return (ALLOWED_WINDOWS as readonly number[]).includes(n) ? n : undefined;
}
function parsePage(raw: string | undefined): number {
  const n = Number(raw ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All types" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERNSHIP", label: "Internship" },
];

const WINDOW_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Any deadline" },
  { value: "7", label: "Within 7 days" },
  { value: "14", label: "Within 14 days" },
  { value: "30", label: "Within 30 days" },
  { value: "60", label: "Within 60 days" },
  { value: "90", label: "Within 90 days" },
];

export default async function PublicJobsListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const employmentType = parseType(params.type);
  const locationKeyword = (params.location ?? "").trim() || undefined;
  const deadlineWithinDays = parseWindow(params.within);
  const page = parsePage(params.page);

  const result = await listPublicJobsPaginated({
    page,
    pageSize: PAGE_SIZE,
    employmentType,
    locationKeyword,
    deadlineWithinDays,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          PESO Lambunao
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight text-foreground">
          Active job postings
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Curated openings sourced and verified by PESO staff. Submit
          applications in person at the PESO office during regular office
          hours.
        </p>
      </header>

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
        aria-label="Filter job postings"
      >
        <label className="flex flex-col gap-1.5 text-[12px] text-muted-foreground">
          Employment type
          <select
            name="type"
            defaultValue={employmentType ?? ""}
            className="rounded-md border border-border bg-background px-3 py-2 text-[13.5px] text-foreground"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-muted-foreground">
          Location keyword
          <input
            type="text"
            name="location"
            defaultValue={locationKeyword ?? ""}
            placeholder="e.g. Lambunao"
            className="rounded-md border border-border bg-background px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/60"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-muted-foreground">
          Deadline window
          <select
            name="within"
            defaultValue={
              deadlineWithinDays === undefined ? "" : String(deadlineWithinDays)
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-[13.5px] text-foreground"
          >
            {WINDOW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded-md bg-primary px-4 py-2 text-[13.5px] font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
      </form>

      <section className="mt-8">
        {result.jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-12 text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-foreground/[0.04] text-muted-foreground">
              <Briefcase className="size-4" aria-hidden />
            </span>
            <p className="text-[14px] font-medium text-foreground">
              No openings match the current filter.
            </p>
            <p className="text-[12.5px] text-muted-foreground">
              Adjust the filter or check again soon.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ul className="divide-y divide-border">
              {result.jobs.map((job) => (
                <li key={job.id}>
                  <JobRow
                    id={job.id}
                    title={job.title}
                    employer={job.employer_name}
                    location={job.location}
                    employmentType={job.employment_type}
                    applicationDeadline={job.application_deadline}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {result.totalPages > 1 ? (
        <JobsPaginator
          page={page}
          totalPages={result.totalPages}
          employmentType={employmentType}
          locationKeyword={locationKeyword}
          deadlineWithinDays={deadlineWithinDays}
        />
      ) : null}
    </div>
  );
}

function JobsPaginator({
  page,
  totalPages,
  employmentType,
  locationKeyword,
  deadlineWithinDays,
}: {
  page: number;
  totalPages: number;
  employmentType?: EmploymentType;
  locationKeyword?: string;
  deadlineWithinDays?: number;
}) {
  function buildHref(p: number) {
    const search = new URLSearchParams();
    if (employmentType) search.set("type", employmentType);
    if (locationKeyword) search.set("location", locationKeyword);
    if (deadlineWithinDays !== undefined)
      search.set("within", String(deadlineWithinDays));
    search.set("page", String(p));
    return `/jobs?${search.toString()}`;
  }
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between border-t border-border pt-6 text-[12.5px]"
    >
      <p data-tabular className="text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={buildHref(prev)}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-muted-foreground/60">
            Previous
          </span>
        )}
        {next ? (
          <Link
            href={buildHref(next)}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-muted-foreground/60">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
