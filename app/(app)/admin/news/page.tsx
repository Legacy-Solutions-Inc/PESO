import Link from "next/link";
import { ChevronRight, Pin, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminsOnlyView } from "@/components/admin/admins-only-view";
import { Button } from "@/components/ui/button";
import { listNewsPosts } from "./actions";
import { NewsRowActions } from "./_components/news-row-actions";
import { NewsStatusFilter } from "./_components/news-status-filter";
import {
  newsPostStatusSchema,
  type NewsPostStatus,
} from "@/lib/validations/news-post";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 20;

function parseStatus(raw: string | undefined): NewsPostStatus | "all" {
  if (raw === "all" || raw === undefined) return "all";
  const parsed = newsPostStatusSchema.safeParse(raw);
  return parsed.success ? parsed.data : "all";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function captionExcerpt(caption: string, max = 140): string {
  const collapsed = caption.replace(/\s+/g, " ").trim();
  return collapsed.length <= max ? collapsed : `${collapsed.slice(0, max - 1)}…`;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
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

const STATUS_LABEL: Record<NewsPostStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const STATUS_TONE: Record<NewsPostStatus, string> = {
  draft: "bg-foreground/[0.05] text-muted-foreground ring-foreground/[0.06]",
  published: "bg-status-positive/10 text-status-positive ring-status-positive/20",
  archived: "bg-status-warning/10 text-status-warning ring-status-warning/25",
};

export default async function AdminNewsListPage({ searchParams }: PageProps) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return <AdminsOnlyView reason={adminCheck.error} />;

  const params = await searchParams;
  const status = parseStatus(params.status);
  const page = parsePage(params.page);

  const result = await listNewsPosts({ status, page, pageSize: PAGE_SIZE });
  if (!result.data) {
    return (
      <div className="space-y-6 pt-4">
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {result.error}
        </p>
      </div>
    );
  }

  const { posts, total, totalPages } = result.data;

  return (
    <div className="space-y-8 pb-12">
      <nav aria-label="Breadcrumb" className="pt-2">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <li>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li className="font-medium text-foreground">News &amp; Announcements</li>
        </ol>
      </nav>

      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-tight text-foreground">
            News &amp; announcements
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
            Compose plain-text posts with up to ten photos. Pinned posts surface
            above the public feed; only published posts are visible at /news.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new" className="gap-2">
            <Plus className="size-4" aria-hidden />
            New post
          </Link>
        </Button>
      </header>

      <NewsStatusFilter current={status} />

      <section
        className="overflow-hidden rounded-lg border border-border bg-card"
        aria-label="News posts"
      >
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <p className="text-[14px] font-medium text-foreground">No posts yet.</p>
            <p className="text-[13px] text-muted-foreground">
              Compose your first announcement to populate the public feed.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_TONE[post.status]}`}
                    >
                      {STATUS_LABEL[post.status]}
                    </span>
                    {post.is_pinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/15">
                        <Pin className="size-3" aria-hidden />
                        Pinned
                      </span>
                    ) : null}
                    <span
                      data-tabular
                      className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      Post #{post.id}
                    </span>
                    {post.photos.length > 0 ? (
                      <span
                        data-tabular
                        className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        · {post.photos.length} photo{post.photos.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-foreground">
                    {captionExcerpt(post.caption)}
                  </p>
                  <p
                    data-tabular
                    className="mt-2 text-[12px] text-muted-foreground"
                  >
                    {post.status === "published"
                      ? `Published ${formatDateTime(post.published_at)}`
                      : `Last updated ${formatDateTime(post.updated_at)}`}
                  </p>
                </div>
                <NewsRowActions
                  id={post.id}
                  status={post.status}
                  isPinned={post.is_pinned}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {totalPages > 1 ? (
        <Paginator status={status} page={page} totalPages={totalPages} total={total} />
      ) : null}
    </div>
  );
}

function Paginator({
  status,
  page,
  totalPages,
  total,
}: {
  status: NewsPostStatus | "all";
  page: number;
  totalPages: number;
  total: number;
}) {
  const buildHref = (p: number) =>
    `/admin/news?status=${status}&page=${p}`;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  return (
    <div className="flex flex-col gap-3 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p data-tabular>
        Page {page} of {totalPages} · {total} post{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={buildHref(prev)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground/60">
            Previous
          </span>
        )}
        {next ? (
          <Link
            href={buildHref(next)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-muted-foreground/60">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
