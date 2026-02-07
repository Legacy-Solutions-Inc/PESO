import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUsersList } from "./actions";
import { UsersTable } from "./_components/users-table";

export default async function UserManagementPage() {
  // Check if user is admin
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    redirect("/");
  }

  // Fetch users list
  const result = await getUsersList({
    page: 1,
    pageSize: 20,
  });

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <p className="text-red-500">Error loading users: {result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm font-medium text-slate-500"
      >
        <Link
          href="/"
          className="transition-colors hover:text-dashboard-primary"
        >
          Administration
        </Link>
        <ChevronRight className="mx-2 size-4 text-slate-300" />
        <span className="text-slate-800 dark:text-slate-200">
          User Management
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            System User Management
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Manage system access, user roles, and account statuses.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        initialUsers={result.data.users}
        initialTotal={result.data.total}
        initialPage={result.data.page}
        pageSize={result.data.pageSize}
      />
    </div>
  );
}
