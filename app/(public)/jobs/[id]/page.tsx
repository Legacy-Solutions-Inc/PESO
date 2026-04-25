import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, MapPin, Phone } from "lucide-react";
import { SafeText } from "@/components/public/safe-text";
import { isJobPostingPublic } from "@/lib/visibility/public";
import { getPublicJobById } from "../../_data/queries";
import type { EmploymentType } from "@/lib/validations/job-posting";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function formatSalaryRange(
  min: number | null,
  max: number | null,
): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number) =>
    `₱${n.toLocaleString("en-PH")}`;
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max ?? 0)}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "Job posting — PESO Lambunao" };
  }
  const job = await getPublicJobById(numericId);
  if (
    !job ||
    !isJobPostingPublic(job.status, job.application_deadline)
  ) {
    return { title: "Job posting — PESO Lambunao" };
  }
  return {
    title: `${job.title} at ${job.employer_name} — PESO Lambunao`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} — PESO Lambunao`,
      description: job.description.slice(0, 160),
      images: ["/peso-logo.jpg"],
    },
  };
}

export default async function PublicJobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) notFound();

  const job = await getPublicJobById(numericId);
  if (!job || !isJobPostingPublic(job.status, job.application_deadline)) {
    notFound();
  }

  const salary = formatSalaryRange(job.salary_range_min, job.salary_range_max);

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        Back to jobs
      </Link>

      <header className="mt-6 border-b border-border pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {EMPLOYMENT_TYPE_LABEL[job.employment_type]}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-tight tracking-tight text-foreground">
          {job.title}
        </h1>
        <p className="mt-2 text-[15px] text-foreground/85">
          {job.employer_name}
        </p>
        <dl className="mt-6 grid gap-4 text-[13.5px] sm:grid-cols-3">
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              Location
            </dt>
            <dd className="mt-1 text-foreground">{job.location}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Apply by
            </dt>
            <dd
              data-tabular
              className="mt-1 text-foreground"
            >
              {formatDate(job.application_deadline)}
            </dd>
          </div>
          {salary ? (
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Compensation
              </dt>
              <dd
                data-tabular
                className="mt-1 text-foreground"
              >
                {salary} <span className="text-muted-foreground">PHP</span>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      <div className="mt-10 whitespace-pre-line text-[15.5px] leading-relaxed text-foreground">
        <SafeText>{job.description}</SafeText>
      </div>

      {job.contact_email || job.contact_phone ? (
        <section className="mt-10 rounded-lg border border-border bg-card p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Posting contact
          </h2>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            {job.contact_email ? (
              <li className="flex items-center gap-2 text-foreground">
                <Mail className="size-3.5 text-muted-foreground" aria-hidden />
                <a
                  href={`mailto:${job.contact_email}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {job.contact_email}
                </a>
              </li>
            ) : null}
            {job.contact_phone ? (
              <li className="flex items-center gap-2 text-foreground">
                <Phone className="size-3.5 text-muted-foreground" aria-hidden />
                <span data-tabular>{job.contact_phone}</span>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 rounded-lg border border-border bg-muted/40 p-5">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          How to apply
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-foreground">
          Submit applications in person at the PESO office during regular
          office hours. Bring a valid government ID, your résumé, and any
          supporting documents listed in the posting.
        </p>
        <address className="mt-3 not-italic text-[13.5px] text-foreground">
          {/* TODO: replace with the verified office address once provided. */}
          PESO Lambunao Municipal Hall
          <br />
          Lambunao, Iloilo
        </address>
      </section>
    </article>
  );
}
