import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  FolderOpen,
  UserPlus,
} from "lucide-react";
import { getJobseekers } from "./actions";
import { JobseekersTable } from "./_components/jobseekers-table";
import { BezelSurface } from "@/components/vanguard/bezel-surface";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { PillLink } from "@/components/vanguard/pill-cta";
import { Reveal } from "@/components/vanguard/reveal";
import { parseJobseekersQuery } from "@/lib/validations/jobseekers-query";
import { getUserProfile } from "@/lib/auth/get-user-profile";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobseekersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { page, pageSize, filters } = parseJobseekersQuery(params);

  const [profileResult, result] = await Promise.all([
    getUserProfile(),
    getJobseekers({ page, pageSize, ...filters }),
  ]);

  const currentUserRole: "admin" | "encoder" | "viewer" =
    profileResult.data?.profile.role ?? "viewer";

  if (result.error || !result.data) {
    return (
      <div className="space-y-10 pb-12">
        <JobseekersHeader />
        <Reveal>
          <BezelSurface
            radius="2xl"
            shellPadding="2"
            innerClassName="flex flex-col items-start gap-4 p-10 sm:flex-row sm:items-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/[0.08] text-destructive ring-1 ring-inset ring-destructive/15">
              <HairlineIcon icon={AlertTriangle} className="size-5" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="font-serif text-[1.25rem] font-medium tracking-[-0.02em] text-foreground">
                Unable to load records
              </p>
              <p
                role="alert"
                className="text-[14px] leading-relaxed text-muted-foreground"
              >
                Could not load jobseeker records. Please try reloading the page,
                or contact your administrator if the problem continues.
              </p>
            </div>
          </BezelSurface>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <JobseekersHeader total={result.data.total} />

      <Reveal delay={80}>
        <BezelSurface
          radius="2xl"
          shellPadding="1.5"
          innerClassName="overflow-hidden p-4 sm:p-5"
        >
          <JobseekersTable
            initialData={result.data.jobseekers}
            initialTotal={result.data.total}
            initialPage={page}
            pageSize={pageSize}
            currentUserRole={currentUserRole}
          />
        </BezelSurface>
      </Reveal>
    </div>
  );
}

function JobseekersHeader({ total }: { total?: number }) {
  return (
    <div className="space-y-8 pt-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <li>
            <Link
              href="/"
              className="transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              Dashboard
            </Link>
          </li>
          <li aria-hidden>
            <HairlineIcon icon={ChevronRight} className="size-3" />
          </li>
          <li className="font-medium text-foreground">Jobseeker records</li>
        </ol>
      </nav>

      <Reveal>
        <header className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-5">
            <EyebrowTag tone="primary" dot>
              NSRP registry
            </EyebrowTag>
            <h1 className="font-serif text-[clamp(2.25rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.025em] text-foreground">
              Jobseeker records
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Every registered jobseeker in the Lambunao jurisdiction, with
              filters for barangay, employment status, sex, and registration
              window. All fields are RLS-scoped.
            </p>
            {typeof total === "number" ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  data-tabular
                  className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-foreground/80 ring-1 ring-inset ring-foreground/[0.06]"
                >
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-primary/70"
                  />
                  {total.toLocaleString("en-PH")} total
                </span>
                <span className="text-[12px] text-muted-foreground">
                  matching current filter set
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
            <PillLink
              href="/jobseekers/register"
              variant="primary"
              size="md"
              icon={UserPlus}
            >
              Register jobseeker
            </PillLink>
          </div>
        </header>
      </Reveal>

      {/* Subtle footnote strip — NOT a sticky bar */}
      <Reveal delay={120}>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-foreground/[0.04]">
            <HairlineIcon icon={FolderOpen} className="size-3" />
          </span>
          Filter, sort, paginate below
        </div>
      </Reveal>
    </div>
  );
}
