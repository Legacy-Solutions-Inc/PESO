import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminsOnlyView } from "@/components/admin/admins-only-view";
import { publicMediaUrl } from "@/lib/storage/public-url";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getNewsActivity, getNewsPostById } from "../../actions";
import { NewsComposeForm } from "../../_components/news-compose-form";
import { ActivityFeed } from "@/components/admin/activity-feed";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-foreground/[0.05] text-muted-foreground ring-foreground/[0.06]",
  published: "bg-status-positive/10 text-status-positive ring-status-positive/20",
  archived: "bg-status-warning/10 text-status-warning ring-status-warning/25",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export default async function EditNewsPostPage({ params }: PageProps) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return <AdminsOnlyView reason={adminCheck.error} />;

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) notFound();

  const [postResult, activityResult] = await Promise.all([
    getNewsPostById(numericId),
    getNewsActivity(numericId),
  ]);

  if (postResult.error === "Not found" || !postResult.data) notFound();

  const post = postResult.data;
  const activity = activityResult.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pb-12">
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
          <li>
            <Link href="/admin/news" className="transition-colors hover:text-foreground">
              News
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li className="font-medium text-foreground">Post #{post.id}</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-tight text-foreground">
            Edit announcement
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_TONE[post.status] ?? ""}`}
            >
              {STATUS_LABEL[post.status] ?? post.status}
            </span>
            {post.is_pinned ? (
              <span className="inline-flex items-center rounded-full bg-primary/[0.08] px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/15">
                Pinned
              </span>
            ) : null}
            <span data-tabular>Post #{post.id}</span>
          </p>
        </div>
        {post.status === "published" ? (
          <Link
            href={`/news/${post.id}`}
            target="_blank"
            rel="noopener"
            className="text-[12.5px] font-medium text-foreground/80 underline-offset-4 hover:underline"
          >
            View public post →
          </Link>
        ) : null}
      </header>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="activity">
            Activity{activity.length > 0 ? ` · ${activity.length}` : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="compose" className="pt-6">
          <NewsComposeForm
            mode="edit"
            initial={{
              id: post.id,
              caption: post.caption,
              is_pinned: post.is_pinned,
              status: post.status,
              photos: post.photos,
            }}
            resolveStorageUrl={publicMediaUrl}
          />
        </TabsContent>
        <TabsContent value="activity" className="pt-6">
          <ActivityFeed entries={activity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
