import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getJobseekerById } from "../../actions";
import { jobseekerRecordToFormData } from "../../record-to-form";
import { JobseekerRegistrationFormLayout } from "@/components/jobseeker-registration/form-layout";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobseekerEditPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getJobseekerById(numericId);

  if (result.error || !result.data) {
    notFound();
  }

  const record = result.data;
  const initialData = jobseekerRecordToFormData(record);
  const personalInfo = record.personal_info ?? {};
  const fullName = [
    personalInfo.surname,
    personalInfo.firstName,
    personalInfo.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen space-y-4 bg-slate-50/80 px-1 py-2 dark:bg-slate-950/50">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-slate-500"
      >
        <Link
          href="/jobseekers"
          className="transition-colors hover:text-dashboard-primary active:text-dashboard-primary"
        >
          Jobseekers
        </Link>
        <ChevronRight className="size-4 shrink-0 text-slate-300" />
        <Link
          href={`/jobseekers/${id}`}
          className="truncate transition-colors hover:text-dashboard-primary active:text-dashboard-primary"
        >
          {fullName || "Profile"}
        </Link>
        <ChevronRight className="size-4 shrink-0 text-slate-300" />
        <span className="truncate text-slate-800 dark:text-slate-200">Edit</span>
      </nav>

      <JobseekerRegistrationFormLayout
        encoderEmail={user.email ?? ""}
        jobseekerId={numericId}
        initialData={initialData}
      />
    </div>
  );
}
