import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";
import { getJobseekers } from "./actions";
import { JobseekersTable } from "./_components/jobseekers-table";
import { Button } from "@/components/ui/button";
import { parseJobseekersQuery } from "@/lib/validations/jobseekers-query";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobseekersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { page, pageSize, filters } = parseJobseekersQuery(params);

  const result = await getJobseekers({
    page,
    pageSize,
    ...filters,
  });

  if (result.error || !result.data) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="mb-2 flex">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href="/">Dashboard</Link>
              </li>
              <li>
                <ChevronRight className="size-4" />
              </li>
              <li className="font-medium">Jobseeker Records</li>
            </ol>
          </nav>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Jobseeker Records</h1>
              <p className="mt-2 text-slate-500">
                Manage and view all registered jobseekers in the database.
              </p>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-8 text-center">
          <p className="text-red-600">Error loading jobseekers: {result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <nav aria-label="Breadcrumb" className="mb-2 flex">
          <ol className="flex items-center space-x-2 text-sm text-slate-500">
            <li>
              <Link href="/">Dashboard</Link>
            </li>
            <li>
              <ChevronRight className="size-4" />
            </li>
            <li className="font-medium">Jobseeker Records</li>
          </ol>
        </nav>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Jobseeker Records</h1>
            <p className="mt-2 text-slate-500">
              Manage and view all registered jobseekers in the database.
            </p>
          </div>
          <Button asChild>
            <Link href="/jobseekers/register">
              <UserPlus className="size-4" />
              Register New Jobseeker
            </Link>
          </Button>
        </div>
      </div>

      <JobseekersTable
        initialData={result.data.jobseekers}
        initialTotal={result.data.total}
        initialPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
