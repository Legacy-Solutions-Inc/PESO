import { Activity } from "lucide-react";
import type { AuditLogEntry } from "@/lib/types/news-post";

const ACTION_LABEL: Record<string, string> = {
  CREATE_NEWS_POST: "Created post",
  UPDATE_NEWS_POST: "Updated post",
  PUBLISH_NEWS_POST: "Published",
  UNPUBLISH_NEWS_POST: "Moved to draft",
  ARCHIVE_NEWS_POST: "Archived",
  PIN_NEWS_POST: "Pinned to top",
  UNPIN_NEWS_POST: "Unpinned",
  DELETE_NEWS_POST: "Deleted",
  CREATE_JOB_POSTING: "Created posting",
  UPDATE_JOB_POSTING: "Updated posting",
  ACTIVATE_JOB_POSTING: "Activated",
  CLOSE_JOB_POSTING: "Closed",
  ARCHIVE_JOB_POSTING: "Archived",
  DELETE_JOB_POSTING: "Deleted",
};

function formatTimestamp(value: string): string {
  try {
    return new Date(value).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function describeMetadata(metadata: Record<string, unknown>): string | null {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  if (typeof metadata.from === "string" && typeof metadata.to === "string") {
    return `${metadata.from} → ${metadata.to}`;
  }
  return null;
}

export function ActivityFeed({
  entries,
}: {
  entries: AuditLogEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-foreground/[0.04] text-muted-foreground">
          <Activity className="size-4" aria-hidden />
        </span>
        <p className="text-[13.5px] font-medium text-foreground">No activity yet.</p>
        <p className="text-[12px] text-muted-foreground">
          Save, publish, pin, or archive actions show up here.
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-lg border border-border">
      {entries.map((entry) => {
        const detail = describeMetadata(entry.metadata);
        return (
          <li key={entry.id} className="flex flex-col gap-1 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[13.5px] font-medium text-foreground">
                {ACTION_LABEL[entry.action] ?? entry.action}
              </p>
              <p
                data-tabular
                className="text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                {formatTimestamp(entry.created_at)}
              </p>
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              {entry.actor_email}
              {detail ? <span className="ml-2 text-foreground/70">· {detail}</span> : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
