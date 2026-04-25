"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { publicMediaUrl } from "@/lib/storage/public-url";
import type { PhotoEntry } from "@/lib/validations/news-post";

interface PhotoLightboxProps {
  photos: PhotoEntry[];
}

/**
 * Detail-page gallery: first photo at full width, additional photos in
 * a responsive grid. Clicking any tile opens a modal lightbox with
 * keyboard navigation (Esc closes, ←/→ pages).
 */
export function PhotoLightbox({ photos }: PhotoLightboxProps) {
  const ordered = [...photos].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i + 1) % ordered.length,
    );
  }, [ordered.length]);
  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + ordered.length) % ordered.length,
    );
  }, [ordered.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeIndex, close, next, prev]);

  if (ordered.length === 0) return null;
  const first = ordered[0]!;
  const rest = ordered.slice(1);
  const active = activeIndex !== null ? ordered[activeIndex] : null;

  return (
    <>
      <figure className="overflow-hidden rounded-lg border border-border bg-muted">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Open full-size photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicMediaUrl(first.path)}
            alt={first.alt_text || "Announcement photo 1"}
            className="aspect-[16/10] w-full object-cover"
            loading="eager"
          />
        </button>
        {first.alt_text ? (
          <figcaption className="px-4 py-2 text-[12.5px] text-muted-foreground">
            {first.alt_text}
          </figcaption>
        ) : null}
      </figure>

      {rest.length > 0 ? (
        <ul
          className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
          aria-label="Additional photos"
        >
          {rest.map((p, i) => (
            <li key={p.path}>
              <button
                type="button"
                onClick={() => setActiveIndex(i + 1)}
                className="block w-full overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={`Open photo ${i + 2} of ${ordered.length}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicMediaUrl(p.path)}
                  alt={p.alt_text || `Announcement photo ${i + 2}`}
                  className="aspect-square size-full object-cover"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-inset ring-border"
          >
            <X className="size-4" aria-hidden />
          </button>
          {ordered.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-inset ring-border"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-inset ring-border"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </>
          ) : null}
          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] max-w-5xl flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicMediaUrl(active.path)}
              alt={active.alt_text || "Photo"}
              className="max-h-[80vh] max-w-full rounded-md object-contain"
            />
            {active.alt_text ? (
              <figcaption className="mt-3 max-w-xl text-center text-[13px] text-background/90">
                {active.alt_text}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </>
  );
}
