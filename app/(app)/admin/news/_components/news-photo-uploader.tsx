"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { GripVertical, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NEWS_PHOTOS_MAX,
  NEWS_PHOTO_MAX_BYTES,
  NEWS_PHOTO_MIME_TYPES,
} from "@/lib/validations/news-post";

/**
 * One slot in the uploader's working state. Either an already-uploaded
 * photo (`path` present) or a pending file the parent will upload on
 * submit (`file` present).
 */
export interface PhotoSlot {
  /** Local stable id for React keys; not persisted. */
  localId: string;
  path?: string;
  file?: File;
  altText: string;
  /** Object/blob URL used for preview inside the uploader. */
  previewUrl: string;
}

interface NewsPhotoUploaderProps {
  value: PhotoSlot[];
  onChange: (next: PhotoSlot[]) => void;
  /**
   * Resolves a server path (e.g. "news/123/abc.png") to a public URL the
   * browser can render. The parent passes a closure that builds the URL
   * via the Supabase public bucket.
   */
  resolveStorageUrl: (path: string) => string;
  /** Disabled while the parent is uploading or saving. */
  disabled?: boolean;
}

const ACCEPT = NEWS_PHOTO_MIME_TYPES.join(",");
const MAX_MB = Math.round(NEWS_PHOTO_MAX_BYTES / 1024 / 1024);

function makeLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function NewsPhotoUploader({
  value,
  onChange,
  resolveStorageUrl,
  disabled,
}: NewsPhotoUploaderProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  // Revoke any blob URLs we created when a slot is replaced or removed,
  // and on unmount. Only blob URLs need revoking; storage URLs are normal.
  const blobUrlsRef = useRef(new Set<string>());
  useEffect(() => {
    const tracked = blobUrlsRef.current;
    return () => {
      tracked.forEach((url) => URL.revokeObjectURL(url));
      tracked.clear();
    };
  }, []);

  const remainingSlots = NEWS_PHOTOS_MAX - value.length;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setDropError(null);
      const files = Array.from(incoming);
      const accepted: File[] = [];
      for (const f of files) {
        if (
          !(NEWS_PHOTO_MIME_TYPES as readonly string[]).includes(f.type)
        ) {
          setDropError(`${f.name}: unsupported file type`);
          continue;
        }
        if (f.size > NEWS_PHOTO_MAX_BYTES) {
          setDropError(`${f.name}: larger than ${MAX_MB} MB`);
          continue;
        }
        accepted.push(f);
      }
      if (accepted.length === 0) return;
      const room = NEWS_PHOTOS_MAX - value.length;
      const trimmed = accepted.slice(0, room);
      if (trimmed.length < accepted.length) {
        setDropError(`Only ${NEWS_PHOTOS_MAX} photos allowed per post.`);
      }
      const next: PhotoSlot[] = trimmed.map((file) => {
        const url = URL.createObjectURL(file);
        blobUrlsRef.current.add(url);
        return {
          localId: makeLocalId(),
          file,
          altText: "",
          previewUrl: url,
        };
      });
      onChange([...value, ...next]);
    },
    [value, onChange],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleAltChange(localId: string, altText: string) {
    onChange(
      value.map((p) => (p.localId === localId ? { ...p, altText } : p)),
    );
  }

  function handleRemove(localId: string) {
    const slot = value.find((p) => p.localId === localId);
    if (slot && slot.file && blobUrlsRef.current.has(slot.previewUrl)) {
      URL.revokeObjectURL(slot.previewUrl);
      blobUrlsRef.current.delete(slot.previewUrl);
    }
    onChange(value.filter((p) => p.localId !== localId));
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...value];
    const [moved] = next.splice(fromIndex, 1);
    if (moved) next.splice(toIndex, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Photos
        </p>
        <p
          data-tabular
          className="text-[12px] text-muted-foreground"
        >
          {value.length}/{NEWS_PHOTOS_MAX}
        </p>
      </div>

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((slot, index) => {
            const src = slot.file
              ? slot.previewUrl
              : slot.path
                ? resolveStorageUrl(slot.path)
                : slot.previewUrl;
            const isDragging = dragIndex === index;
            return (
              <li
                key={slot.localId}
                draggable={!disabled}
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) {
                    handleReorder(dragIndex, index);
                  }
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-md border border-border bg-card",
                  isDragging && "opacity-50",
                )}
              >
                <div className="relative aspect-square w-full bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={slot.altText || `Photo ${index + 1}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => handleRemove(slot.localId)}
                    disabled={disabled}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm ring-1 ring-inset ring-border transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                  </button>
                  <span
                    aria-hidden
                    className="absolute left-2 top-2 flex size-7 cursor-grab items-center justify-center rounded-full bg-background/95 text-muted-foreground shadow-sm ring-1 ring-inset ring-border active:cursor-grabbing"
                  >
                    <GripVertical className="size-3.5" />
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <label
                    htmlFor={`alt-${slot.localId}`}
                    className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Alt text
                  </label>
                  <input
                    id={`alt-${slot.localId}`}
                    value={slot.altText}
                    onChange={(e) =>
                      handleAltChange(slot.localId, e.target.value)
                    }
                    disabled={disabled}
                    placeholder="Describe the photo"
                    maxLength={500}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-[12.5px] text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {remainingSlots > 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={handleDrop}
          className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-4 py-8 text-center"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-foreground/[0.04] text-muted-foreground">
            <ImageIcon className="size-5" aria-hidden />
          </span>
          <p className="text-[13.5px] font-medium text-foreground">
            Drag photos here or browse
          </p>
          <p className="text-[12px] text-muted-foreground">
            JPG, PNG, WebP, or GIF · up to {MAX_MB} MB each ·{" "}
            {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} remaining
          </p>
          <label
            htmlFor={fileInputId}
            className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
          >
            <Upload className="size-3.5" aria-hidden />
            Choose files
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={ACCEPT}
              multiple
              onChange={handleInputChange}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">
          Maximum of {NEWS_PHOTOS_MAX} photos reached. Remove one to add another.
        </p>
      )}

      {dropError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive"
        >
          <Loader2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {dropError}
        </p>
      ) : null}
    </div>
  );
}
