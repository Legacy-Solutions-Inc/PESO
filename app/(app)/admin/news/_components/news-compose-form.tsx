"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  EyeOff,
  Loader2,
  Pin,
  Save,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  archiveNewsPost,
  createNewsPost,
  publishNewsPost,
  unpublishNewsPost,
  updateNewsPost,
  uploadNewsPhoto,
} from "../actions";
import {
  NEWS_CAPTION_MAX,
  type NewsPostStatus,
  type PhotoEntry,
} from "@/lib/validations/news-post";
import { publicMediaUrl } from "@/lib/storage/public-url";
import { NewsPhotoUploader, type PhotoSlot } from "./news-photo-uploader";

interface NewsComposeFormProps {
  mode: "new" | "edit";
  initial?: {
    id: number;
    caption: string;
    is_pinned: boolean;
    status: NewsPostStatus;
    photos: PhotoEntry[];
  };
}

type SubmitIntent = "save_draft" | "publish" | "unpublish" | "archive";

type SubmitPhase = "idle" | "uploading" | "saving";

// Stable localId for already-persisted photos: the storage path is unique
// per photo, so using it as the React key + slot id is hydration-safe
// (server and client produce identical strings). Brand-new slots created
// from a user upload generate a UUID inside the uploader — that path runs
// only on the client, after hydration, so randomUUID() is fine there.
function photosToSlots(photos: PhotoEntry[]): PhotoSlot[] {
  return [...photos]
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => ({
      localId: `path:${p.path}`,
      path: p.path,
      altText: p.alt_text,
      previewUrl: publicMediaUrl(p.path),
      compressing: false,
    }));
}

function slotsToEntries(
  slots: PhotoSlot[],
  uploaded: Map<string, string>,
): PhotoEntry[] {
  return slots
    .map((slot, index) => {
      const path = slot.path ?? uploaded.get(slot.localId);
      if (!path) return null;
      return {
        path,
        alt_text: slot.altText.trim(),
        display_order: index,
      } satisfies PhotoEntry;
    })
    .filter((p): p is PhotoEntry => p !== null);
}

export function NewsComposeForm({
  mode,
  initial,
}: NewsComposeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const captionRef = useRef<HTMLTextAreaElement | null>(null);

  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [isPinned, setIsPinned] = useState(initial?.is_pinned ?? false);
  const [photos, setPhotos] = useState<PhotoSlot[]>(() =>
    initial ? photosToSlots(initial.photos) : [],
  );
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [activeIntent, setActiveIntent] = useState<SubmitIntent | null>(null);

  const compressingCount = photos.filter((p) => p.compressing).length;
  const erroredCount = photos.filter((p) => p.compressionError).length;
  const photosBlockSubmit = compressingCount > 0 || erroredCount > 0;

  // Autosize the caption textarea on every input.
  useEffect(() => {
    const el = captionRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [caption]);

  const captionTooLong = caption.length > NEWS_CAPTION_MAX;
  const captionEmpty = caption.trim().length === 0;
  const status = initial?.status ?? "draft";

  const showUnpublish = mode === "edit" && status === "published";
  const showArchive = mode === "edit" && status !== "archived";

  async function uploadPendingPhotos(
    postId: number,
  ): Promise<{ map: Map<string, string>; error?: string }> {
    const map = new Map<string, string>();
    for (const slot of photos) {
      if (slot.path) continue;
      if (!slot.file) continue;
      const fd = new FormData();
      fd.set("postId", String(postId));
      fd.set("file", slot.file);
      const result = await uploadNewsPhoto(fd);
      if (!result.data) {
        return { map, error: result.error ?? "Upload failed" };
      }
      map.set(slot.localId, result.data.path);
    }
    return { map };
  }

  async function applyStatusIntent(
    postId: number,
    intent: SubmitIntent,
    currentStatus: NewsPostStatus,
  ): Promise<{ ok: boolean; error?: string }> {
    if (intent === "save_draft") return { ok: true };
    const target =
      intent === "publish"
        ? "published"
        : intent === "unpublish"
          ? "draft"
          : "archived";
    if (target === currentStatus) return { ok: true };
    const action =
      intent === "publish"
        ? publishNewsPost
        : intent === "unpublish"
          ? unpublishNewsPost
          : archiveNewsPost;
    const r = await action(postId);
    if (r.error) return { ok: false, error: r.error };
    return { ok: true };
  }

  function handleSubmit(intent: SubmitIntent) {
    if (captionEmpty || captionTooLong) {
      toast({
        title: "Cannot save",
        description: captionEmpty
          ? "Caption cannot be empty."
          : `Caption must be ${NEWS_CAPTION_MAX} characters or fewer.`,
      });
      return;
    }
    if (compressingCount > 0) {
      toast({
        title: "Photos still compressing",
        description: `${compressingCount} photo${compressingCount === 1 ? "" : "s"} not ready yet — wait a moment.`,
      });
      return;
    }
    if (erroredCount > 0) {
      toast({
        title: "Remove failed photos first",
        description: `${erroredCount} photo${erroredCount === 1 ? "" : "s"} could not be compressed. Remove them before saving.`,
      });
      return;
    }
    setActiveIntent(intent);
    startTransition(async () => {
      let postId = initial?.id;
      const currentStatus: NewsPostStatus = initial?.status ?? "draft";

      try {
        if (mode === "new") {
          const created = await createNewsPost({
            caption: caption.trim(),
            is_pinned: isPinned,
          });
          if (!created.data) {
            toast({
              title: "Could not create post",
              description: created.error ?? "Unknown error",
            });
            return;
          }
          postId = created.data.id;
        }

        if (postId === undefined) {
          toast({ title: "Internal error: missing id" });
          return;
        }

        setPhase("uploading");
        const upload = await uploadPendingPhotos(postId);
        if (upload.error) {
          toast({
            title: "Photo upload failed",
            description: upload.error,
          });
          return;
        }

        setPhase("saving");
        const photoEntries = slotsToEntries(photos, upload.map);

        const updated = await updateNewsPost(postId, {
          caption: caption.trim(),
          is_pinned: isPinned,
          photos: photoEntries,
        });
        if (!updated.data) {
          toast({
            title: "Could not save",
            description: updated.error ?? "Unknown error",
          });
          return;
        }

        const transitionResult = await applyStatusIntent(
          postId,
          intent,
          currentStatus,
        );
        if (!transitionResult.ok) {
          toast({
            title: "Status change failed",
            description: transitionResult.error,
          });
          return;
        }

        toast({
          title:
            intent === "publish"
              ? "Published"
              : intent === "unpublish"
                ? "Moved to draft"
                : intent === "archive"
                  ? "Archived"
                  : "Saved",
        });

        if (mode === "new") {
          router.replace(`/admin/news/${postId}/edit`);
        } else {
          router.refresh();
        }
      } finally {
        setPhase("idle");
        setActiveIntent(null);
      }
    });
  }

  function labelFor(
    intent: SubmitIntent,
    fallback: string,
  ): string {
    if (activeIntent !== intent) return fallback;
    if (phase === "uploading") return "Uploading…";
    if (phase === "saving") return "Saving…";
    return fallback;
  }

  const counterTone = useMemo(() => {
    if (captionTooLong) return "text-destructive";
    if (caption.length > NEWS_CAPTION_MAX * 0.9)
      return "text-status-warning";
    return "text-muted-foreground";
  }, [caption.length, captionTooLong]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <label
          htmlFor="news-caption"
          className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
        >
          Caption
        </label>
        <textarea
          id="news-caption"
          ref={captionRef}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={isPending}
          placeholder="Write the announcement. Plain text — line breaks are preserved."
          rows={6}
          className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-[15px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            URLs become links automatically. No HTML or markdown.
          </p>
          <p data-tabular className={cn("text-[12px] font-medium", counterTone)}>
            {caption.length}/{NEWS_CAPTION_MAX}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <NewsPhotoUploader
          value={photos}
          onChange={setPhotos}
          disabled={isPending}
        />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            disabled={isPending}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="flex items-center gap-2 text-[13.5px] font-medium text-foreground">
            <Pin className="size-3.5 text-muted-foreground" aria-hidden />
            Pin to top of public feed
          </span>
        </label>
        <p className="text-[12px] text-muted-foreground">
          The most-recently-published pinned post wins on the landing page.
        </p>
      </section>

      <div className="space-y-3 border-t border-border pt-6">
        {photosBlockSubmit ? (
          <p
            data-tabular
            className={cn(
              "text-[12.5px]",
              erroredCount > 0
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {erroredCount > 0
              ? `${erroredCount} photo${erroredCount === 1 ? "" : "s"} failed to compress — remove and retry before saving.`
              : `Compressing ${compressingCount} photo${compressingCount === 1 ? "" : "s"}…`}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => handleSubmit("save_draft")}
            disabled={
              isPending ||
              captionEmpty ||
              captionTooLong ||
              photosBlockSubmit
            }
            variant="outline"
            className="gap-2"
          >
            {isPending && activeIntent === "save_draft" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            {labelFor(
              "save_draft",
              mode === "new" ? "Save draft" : "Save changes",
            )}
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit("publish")}
            disabled={
              isPending ||
              captionEmpty ||
              captionTooLong ||
              photosBlockSubmit
            }
            className="gap-2"
          >
            {isPending && activeIntent === "publish" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : status === "published" ? (
              <CheckCircle2 className="size-4" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {labelFor(
              "publish",
              status === "published" ? "Save & re-publish" : "Publish",
            )}
          </Button>
          {showUnpublish ? (
            <Button
              type="button"
              onClick={() => handleSubmit("unpublish")}
              disabled={isPending || photosBlockSubmit}
              variant="outline"
              className="gap-2"
            >
              {isPending && activeIntent === "unpublish" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <EyeOff className="size-4" aria-hidden />
              )}
              {labelFor("unpublish", "Unpublish")}
            </Button>
          ) : null}
          {showArchive ? (
            <Button
              type="button"
              onClick={() => handleSubmit("archive")}
              disabled={isPending || photosBlockSubmit}
              variant="outline"
              className="gap-2"
            >
              {isPending && activeIntent === "archive" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Archive className="size-4" aria-hidden />
              )}
              {labelFor("archive", "Archive")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
