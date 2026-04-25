import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getJobseekerById } from "../actions";
import { JobseekerProfileView } from "./_components/jobseeker-profile-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobseekerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    notFound();
  }

  const result = await getJobseekerById(numericId);

  if (result.error || !result.data) {
    notFound();
  }

  const record = result.data;
  const personalInfo = record.personal_info;
  const fullName = [
    personalInfo?.surname,
    personalInfo?.firstName,
    personalInfo?.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="pb-16 pt-2">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <li>
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li>
            <Link
              href="/jobseekers"
              className="transition-colors hover:text-foreground"
            >
              Jobseekers
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li className="font-medium text-foreground">{fullName || "—"}</li>
        </ol>
      </nav>

      <JobseekerProfileView record={record} />
    </div>
  );
}
