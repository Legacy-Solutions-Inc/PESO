import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * Server-rendered "you are not an admin" page. Used as the fallback for
 * every /admin/* server component when requireAdmin() rejects, so the
 * gate is enforced in the page file itself, not just by middleware or
 * the sidebar filter.
 */
export function AdminsOnlyView({ reason }: { reason?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-status-warning/10 text-status-warning">
        <ShieldAlert className="size-5" aria-hidden />
      </span>
      <h1 className="mt-6 font-serif text-[1.75rem] font-medium tracking-tight text-foreground">
        Admins only
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
        {reason ??
          "This area of the system is restricted to administrators. If you need access, ask your PESO administrator to update your role."}
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-[13.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
