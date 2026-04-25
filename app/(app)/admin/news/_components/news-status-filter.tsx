import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NewsPostStatus } from "@/lib/validations/news-post";

const TABS: Array<{ value: NewsPostStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function NewsStatusFilter({
  current,
}: {
  current: NewsPostStatus | "all";
}) {
  return (
    <nav
      aria-label="Filter by status"
      className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1"
    >
      {TABS.map((tab) => {
        const active = tab.value === current;
        return (
          <Link
            key={tab.value}
            href={`/admin/news?status=${tab.value}&page=1`}
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
  );
}
