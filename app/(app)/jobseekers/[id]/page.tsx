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
    <div className="min-h-screen space-y-8 bg-slate-50/80 px-1 py-2 dark:bg-slate-950/50">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm font-medium text-slate-500"
      >
        <Link
          href="/"
          className="transition-colors hover:text-dashboard-primary"
        >
          Dashboard
        </Link>
        <ChevronRight className="mx-2 size-4 text-slate-300" />
        <Link
          href="/jobseekers"
          className="transition-colors hover:text-dashboard-primary"
        >
          Jobseekers
        </Link>
        <ChevronRight className="mx-2 size-4 text-slate-300" />
        <span className="text-slate-800 dark:text-slate-200">{fullName}</span>
      </nav>

      <JobseekerProfileView record={record} />
    </div>
  );
}
