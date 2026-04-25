import type { Metadata } from "next";
import Link from "next/link";
import { NewsFeedCard } from "@/components/public/news-feed-card";
import { listPublicNewsPaginated } from "../_data/queries";

export const metadata: Metadata = {
  title: "News & announcements — PESO Lambunao",
  description:
    "All published announcements from the Public Employment Service Office of the Municipality of Lambunao.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 12;

function parsePage(raw: string | undefined): number {
  const n = Number(raw ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export default async function PublicNewsListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const result = await listPublicNewsPaginated(page, PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          PESO Lambunao
        </p>
        <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight text-foreground">
          News &amp; announcements
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          All published announcements, with the most recently pinned post on
          top followed by chronological order.
        </p>
      </header>

      <section className="mt-10">
        {result.posts.length === 0 ? (
          <p className="text-[14px] text-muted-foreground">
            No announcements yet — check back soon.
          </p>
        ) : (
          <ul className="space-y-6">
            {result.posts.map((post) => (
              <li key={post.id}>
                <NewsFeedCard
                  id={post.id}
                  caption={post.caption}
                  photos={post.photos}
                  publishedAt={post.published_at}
                  variant={post.is_pinned ? "pinned" : "feed"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {result.totalPages > 1 ? (
        <NewsPaginator page={page} totalPages={result.totalPages} />
      ) : null}
    </div>
  );
}

function NewsPaginator({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between border-t border-border pt-6 text-[12.5px]"
    >
      <p data-tabular className="text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={`/news?page=${prev}`}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-muted-foreground/60">
            Previous
          </span>
        )}
        {next ? (
          <Link
            href={`/news?page=${next}`}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-muted-foreground/60">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
