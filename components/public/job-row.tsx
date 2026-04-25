import Link from "next/link";
import type {
  EmploymentType,
} from "@/lib/validations/job-posting";

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
  INTERNSHIP: "Internship",
};

interface JobRowProps {
  id: number;
  title: string;
  employer: string;
  location: string;
  employmentType: EmploymentType;
  applicationDeadline: string;
}

function formatDate(value: string): string {
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

export function JobRow({
  id,
  title,
  employer,
  location,
  employmentType,
  applicationDeadline,
}: JobRowProps) {
  return (
    <Link
      href={`/jobs/${id}`}
      className="group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-foreground/[0.02]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        <span className="rounded-full bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-inset ring-foreground/[0.06]">
          {EMPLOYMENT_TYPE_LABEL[employmentType]}
        </span>
      </div>
      <p className="text-[13px] text-muted-foreground">
        {employer} · {location}
      </p>
      <p
        data-tabular
        className="text-[12.5px] text-foreground/75"
      >
        Apply by {formatDate(applicationDeadline)}
      </p>
    </Link>
  );
}
