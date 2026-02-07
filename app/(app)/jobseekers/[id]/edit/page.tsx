import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Pencil } from "lucide-react";
import { getJobseekerById } from "../../actions";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobseekerEditPage({ params }: PageProps) {
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
  const personalInfo = record.personal_info ?? {};
  const fullName = [
    personalInfo.surname,
    personalInfo.firstName,
    personalInfo.middleName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm font-medium text-slate-500"
      >
        <Link
          href="/jobseekers"
          className="transition-colors hover:text-dashboard-primary"
        >
          Jobseekers
        </Link>
        <ChevronRight className="mx-2 size-4 text-slate-300" />
        <Link
          href={`/jobseekers/${id}`}
          className="transition-colors hover:text-dashboard-primary"
        >
          {fullName || "Profile"}
        </Link>
        <ChevronRight className="mx-2 size-4 text-slate-300" />
        <span className="text-slate-800 dark:text-slate-200">Edit</span>
      </nav>

      <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-dashboard-primary/10">
          <Pencil className="size-8 text-dashboard-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Edit Profile
        </h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Edit form for jobseeker records is not yet implemented. You can view the profile or return to the list.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/jobseekers/${id}`}>View Profile</Link>
          </Button>
          <Button className="bg-dashboard-primary hover:bg-dashboard-primary/90" asChild>
            <Link href="/jobseekers">Back to Records</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
