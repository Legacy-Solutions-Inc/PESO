import Link from "next/link";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/validations/job-posting";

const STATUS_TABS: Array<{ value: JobStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

const WINDOW_OPTIONS: Array<{ value: number | "any"; label: string }> = [
  { value: "any", label: "Any deadline" },
  { value: 7, label: "Within 7 days" },
  { value: 14, label: "Within 14 days" },
  { value: 30, label: "Within 30 days" },
  { value: 60, label: "Within 60 days" },
  { value: 90, label: "Within 90 days" },
];

function buildHref(
  status: JobStatus | "all",
  within: number | "any",
): string {
  const search = new URLSearchParams({ status, page: "1" });
  if (within !== "any") search.set("within", String(within));
  return `/admin/jobs?${search.toString()}`;
}

export function JobsFilters({
  status,
  within,
}: {
  status: JobStatus | "all";
  within: number | undefined;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav
        aria-label="Filter by status"
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1"
      >
        {STATUS_TABS.map((tab) => {
          const active = tab.value === status;
          return (
            <Link
              key={tab.value}
              href={buildHref(tab.value, within ?? "any")}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                active
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1">
        {WINDOW_OPTIONS.map((opt) => {
          const active =
            opt.value === "any" ? within === undefined : opt.value === within;
          return (
            <Link
              key={String(opt.value)}
              href={buildHref(status, opt.value)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                active
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
