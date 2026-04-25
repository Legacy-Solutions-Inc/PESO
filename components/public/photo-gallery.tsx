import Link from "next/link";
import { publicMediaUrl } from "@/lib/storage/public-url";
import type { PhotoEntry } from "@/lib/validations/news-post";

/**
 * Compact gallery used on news feed cards. Up to four tile layouts:
 *   - 1 photo: full width
 *   - 2 photos: 2-up
 *   - 3+ photos: 3-up grid; if more, the third tile shows a +N badge
 *
 * Wraps the whole grid in a Link to /news/[id] when the post is
 * clickable from a feed surface.
 */
interface FeedGalleryProps {
  postId: number;
  photos: PhotoEntry[];
}

export function FeedGallery({ postId, photos }: FeedGalleryProps) {
  if (photos.length === 0) return null;
  const ordered = [...photos].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const href = `/news/${postId}`;

  if (ordered.length === 1) {
    const p = ordered[0]!;
    return (
      <Link
        href={href}
        className="block overflow-hidden rounded-md border border-border bg-muted"
      >
        <span className="block aspect-[16/10] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicMediaUrl(p.path)}
            alt={p.alt_text || "Announcement photo"}
            className="size-full object-cover"
            loading="lazy"
          />
        </span>
      </Link>
    );
  }

  if (ordered.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-md">
        {ordered.map((p) => (
          <Link
            key={p.path}
            href={href}
            className="overflow-hidden rounded-sm border border-border bg-muted"
          >
            <span className="block aspect-[4/3] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicMediaUrl(p.path)}
                alt={p.alt_text || "Announcement photo"}
                className="size-full object-cover"
                loading="lazy"
              />
            </span>
          </Link>
        ))}
      </div>
    );
  }

  // 3+ photos — show three tiles, with overflow badge on the third
  const display = ordered.slice(0, 3);
  const overflow = ordered.length - 3;
  return (
    <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-md">
      {display.map((p, i) => (
        <Link
          key={p.path}
          href={href}
          className="relative overflow-hidden rounded-sm border border-border bg-muted"
        >
          <span className="block aspect-square w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicMediaUrl(p.path)}
              alt={p.alt_text || "Announcement photo"}
              className="size-full object-cover"
              loading="lazy"
            />
          </span>
          {i === 2 && overflow > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/55 font-serif text-[clamp(1.5rem,3vw,2rem)] font-medium text-background">
              +{overflow}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
