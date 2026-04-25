import Link from "next/link";
import { Pin } from "lucide-react";
import { SafeText } from "@/components/public/safe-text";
import { FeedGallery } from "@/components/public/photo-gallery";
import type { PhotoEntry } from "@/lib/validations/news-post";

const TRUNCATE_AT = 280;

interface NewsFeedCardProps {
  id: number;
  caption: string;
  photos: PhotoEntry[];
  publishedAt: string | null;
  variant?: "feed" | "pinned";
}

function formatRelative(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function smartTruncate(text: string, max: number): {
  display: string;
  truncated: boolean;
} {
  const trimmed = text.trim();
  if (trimmed.length <= max) return { display: trimmed, truncated: false };
  // Cut at the nearest space below the limit so we don't break URLs or words.
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut =
    lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return { display: `${cut.trimEnd()}…`, truncated: true };
}

export function NewsFeedCard({
  id,
  caption,
  photos,
  publishedAt,
  variant = "feed",
}: NewsFeedCardProps) {
  const { display, truncated } = smartTruncate(caption, TRUNCATE_AT);
  const dateLabel = formatRelative(publishedAt);
  const detailHref = `/news/${id}`;

  return (
    <article className="rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <div className="flex items-baseline gap-2">
          <p className="text-[13.5px] font-medium text-foreground">
            PESO Lambunao
          </p>
          {dateLabel ? (
            <p
              data-tabular
              className="text-[12px] text-muted-foreground"
            >
              · {dateLabel}
            </p>
          ) : null}
        </div>
        {variant === "pinned" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-primary ring-1 ring-inset ring-primary/15">
            <Pin className="size-3" aria-hidden />
            Pinned
          </span>
        ) : null}
      </header>

      <div className="space-y-4 px-5 pb-5 pt-3">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground">
          <SafeText>{display}</SafeText>
        </p>

        {truncated ? (
          <Link
            href={detailHref}
            className="inline-block text-[13px] font-medium text-primary underline-offset-4 hover:underline"
          >
            Read more →
          </Link>
        ) : null}

        {photos.length > 0 ? (
          <FeedGallery postId={id} photos={photos} />
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-3 text-[12px] text-muted-foreground">
          <Link
            href={detailHref}
            className="font-medium text-foreground/80 underline-offset-4 hover:underline"
          >
            View announcement →
          </Link>
          <span data-tabular>
            #{id}
          </span>
        </div>
      </div>
    </article>
  );
}
