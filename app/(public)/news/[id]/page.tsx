import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SafeText } from "@/components/public/safe-text";
import { PhotoLightbox } from "@/components/public/photo-lightbox";
import { publicMediaUrl } from "@/lib/storage/public-url";
import { isNewsPostPublic } from "@/lib/visibility/public";
import { getPublicNewsPostById } from "../../_data/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

function makeExcerpt(caption: string, max = 160): string {
  const trimmed = caption.replace(/\s+/g, " ").trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "Announcement — PESO Lambunao" };
  }
  const post = await getPublicNewsPostById(numericId);
  if (
    !post ||
    !isNewsPostPublic(post.status, post.published_at)
  ) {
    return { title: "Announcement — PESO Lambunao" };
  }
  const ordered = [...post.photos].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const ogImage = ordered[0] ? publicMediaUrl(ordered[0].path) : "/peso-logo.jpg";
  const description = makeExcerpt(post.caption);
  return {
    title: `Announcement #${post.id} — PESO Lambunao`,
    description,
    openGraph: {
      title: `Announcement #${post.id} — PESO Lambunao`,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicNewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) notFound();

  const post = await getPublicNewsPostById(numericId);
  // RLS already restricts to status=published+published_at<=now() for anon,
  // but maybeSingle() still returns data for admins reading their own
  // drafts. Mirror the public visibility rule explicitly.
  if (!post || !isNewsPostPublic(post.status, post.published_at)) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        Back to news
      </Link>

      <header className="mt-6 border-b border-border pb-6">
        <p
          data-tabular
          className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          PESO Lambunao · {formatDate(post.published_at)}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium leading-tight tracking-tight text-foreground">
          Announcement #{post.id}
        </h1>
      </header>

      <div className="mt-8 whitespace-pre-line text-[16px] leading-relaxed text-foreground">
        <SafeText>{post.caption}</SafeText>
      </div>

      {post.photos.length > 0 ? (
        <div className="mt-10">
          <PhotoLightbox photos={post.photos} />
        </div>
      ) : null}
    </article>
  );
}
