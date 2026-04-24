import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getUsersList } from "./actions";
import { UsersTable } from "./_components/users-table";

export default async function UserManagementPage() {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    redirect("/");
  }

  const result = await getUsersList({
    page: 1,
    pageSize: 20,
  });

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Could not load the user list. Please try reloading the page, or contact another administrator if the problem continues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center text-sm font-medium text-muted-foreground"
      >
        <Link
          href="/"
          className="transition-colors hover:text-foreground"
        >
          Administration
        </Link>
        <ChevronRight
          className="mx-2 size-4 text-muted-foreground/60"
          aria-hidden
        />
        <span className="text-foreground">User management</span>
      </nav>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            User management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review access requests, set roles, and manage account status.
          </p>
        </div>
      </header>

      <UsersTable
        initialUsers={result.data.users}
        initialTotal={result.data.total}
        initialPage={result.data.page}
        pageSize={result.data.pageSize}
      />
    </div>
  );
}
