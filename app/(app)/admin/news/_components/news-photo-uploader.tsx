"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  GripVertical,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NEWS_PHOTOS_MAX,
  NEWS_PHOTO_MAX_BYTES,
  NEWS_PHOTO_MIME_TYPES,
} from "@/lib/validations/news-post";
import { publicMediaUrl } from "@/lib/storage/public-url";
import {
  CompressionError,
  compressNewsPhoto,
} from "@/lib/image/compress";
import { useToast } from "@/hooks/use-toast";

/**
 * One slot in the uploader's working state. Either an already-uploaded
 * photo (`path` present) or a pending file the parent will upload on
 * submit (`file` present, compressed).
 *
 * Lifecycle of a freshly added local file:
 *   1. select   → { compressing: true,  rawFile: original, file: undefined }
 *   2. success  → { compressing: false, rawFile: undefined, file: compressed, sizeBytes }
 *   3. failure  → { compressing: false, rawFile: undefined, file: undefined, compressionError }
 *
 * Per the project's image-upload rule, the original `File` is dropped
 * from state on success — only the compressed file lives on.
 */
export interface PhotoSlot {
  /** Local stable id for React keys; not persisted. */
  localId: string;
  /** Server path for already-uploaded photos. Mutually exclusive with file. */
  path?: string;
  /** Compressed file ready for upload. Undefined while compressing. */
  file?: File;
  /** Raw file held only during compression — cleared on success or failure. */
  rawFile?: File;
  /** True while `compressNewsPhoto` is in flight. */
  compressing: boolean;
  /** Human-readable compression error; user must remove the slot to retry. */
  compressionError?: string;
  /** Compressed size in bytes. Present once compression succeeds. */
  sizeBytes?: number;
  altText: string;
  /** Object URL for the inline thumbnail preview. */
  previewUrl: string;
}

interface NewsPhotoUploaderProps {
  value: PhotoSlot[];
  onChange: (next: PhotoSlot[]) => void;
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

function formatKB(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function NewsPhotoUploader({
  value,
  onChange,
  disabled,
}: NewsPhotoUploaderProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const { toast } = useToast();

  // Track every blob URL we mint so we can revoke them on unmount and
  // when a preview is replaced (e.g. raw → compressed).
  const blobUrlsRef = useRef(new Set<string>());
  useEffect(() => {
    const tracked = blobUrlsRef.current;
    return () => {
      tracked.forEach((url) => URL.revokeObjectURL(url));
      tracked.clear();
    };
  }, []);

  // Async compression callbacks need the freshest slot list to update;
  // a ref avoids stale-closure bugs without re-creating the callback.
  // Sync the ref in an effect so we don't write during render.
  const latestRef = useRef(value);
  useEffect(() => {
    latestRef.current = value;
  }, [value]);

  const remainingSlots = NEWS_PHOTOS_MAX - value.length;

  const updateSlot = useCallback(
    (localId: string, partial: Partial<PhotoSlot>) => {
      const next = latestRef.current.map((p) =>
        p.localId === localId ? { ...p, ...partial } : p,
      );
      onChange(next);
    },
    [onChange],
  );

  const startCompression = useCallback(
    async (localId: string, raw: File) => {
      try {
        const compressed = await compressNewsPhoto(raw);
        // Slot may have been removed while compression was in flight.
        const stillExists = latestRef.current.find(
          (p) => p.localId === localId,
        );
        if (!stillExists) return;

        // Mint a fresh preview from the compressed bytes and revoke the
        // raw preview — this drops the last reference to the original.
        const newPreview = URL.createObjectURL(compressed);
        blobUrlsRef.current.add(newPreview);
        if (blobUrlsRef.current.has(stillExists.previewUrl)) {
          URL.revokeObjectURL(stillExists.previewUrl);
          blobUrlsRef.current.delete(stillExists.previewUrl);
        }

        updateSlot(localId, {
          file: compressed,
          rawFile: undefined,
          compressing: false,
          compressionError: undefined,
          previewUrl: newPreview,
          sizeBytes: compressed.size,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Compression failed";
        updateSlot(localId, {
          file: undefined,
          rawFile: undefined,
          compressing: false,
          compressionError: message,
        });
        if (err instanceof CompressionError) {
          if (err.code === "INVALID_TYPE") {
            toast({
              title: "Only image files are allowed.",
              description: message,
            });
          } else if (err.code === "OVERSIZE_AFTER_COMPRESSION") {
            toast({ title: "Image too large", description: message });
          } else {
            toast({ title: "Image could not be encoded", description: message });
          }
        } else {
          toast({ title: "Compression failed", description: message });
        }
      }
    },
    [toast, updateSlot],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setDropError(null);
      const files = Array.from(incoming);
      const accepted: File[] = [];
      for (const f of files) {
        if (!(NEWS_PHOTO_MIME_TYPES as readonly string[]).includes(f.type)) {
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

      const room = NEWS_PHOTOS_MAX - latestRef.current.length;
      const trimmed = accepted.slice(0, room);
      if (trimmed.length < accepted.length) {
        setDropError(`Only ${NEWS_PHOTOS_MAX} photos allowed per post.`);
      }

      const newSlots: PhotoSlot[] = trimmed.map((file) => {
        const url = URL.createObjectURL(file);
        blobUrlsRef.current.add(url);
        return {
          localId: makeLocalId(),
          rawFile: file,
          compressing: true,
          altText: "",
          previewUrl: url,
        };
      });
      onChange([...latestRef.current, ...newSlots]);

      // Kick off compression in parallel — the Web Worker keeps the
      // main thread responsive even with a few photos in flight.
      newSlots.forEach((slot) => {
        if (slot.rawFile) {
          startCompression(slot.localId, slot.rawFile);
        }
      });
    },
    [onChange, startCompression],
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
      latestRef.current.map((p) =>
        p.localId === localId ? { ...p, altText } : p,
      ),
    );
  }

  function handleRemove(localId: string) {
    const slot = latestRef.current.find((p) => p.localId === localId);
    if (slot && blobUrlsRef.current.has(slot.previewUrl)) {
      URL.revokeObjectURL(slot.previewUrl);
      blobUrlsRef.current.delete(slot.previewUrl);
    }
    onChange(latestRef.current.filter((p) => p.localId !== localId));
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...latestRef.current];
    const [moved] = next.splice(fromIndex, 1);
    if (moved) next.splice(toIndex, 0, moved);
    onChange(next);
  }

  const compressingCount = value.filter((p) => p.compressing).length;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Photos
        </p>
        <p data-tabular className="text-[12px] text-muted-foreground">
          {value.length}/{NEWS_PHOTOS_MAX}
          {compressingCount > 0 ? (
            <span className="ml-2 text-foreground/70">
              · {compressingCount} compressing
            </span>
          ) : null}
        </p>
      </div>

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((slot, index) => {
            const src = slot.file
              ? slot.previewUrl
              : slot.path
                ? publicMediaUrl(slot.path)
                : slot.previewUrl;
            const isDragging = dragIndex === index;
            return (
              <li
                key={slot.localId}
                draggable={!disabled && !slot.compressing}
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

                  {slot.compressing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/55 text-background">
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                      <span className="text-[11px] font-medium uppercase tracking-[0.16em]">
                        Compressing image…
                      </span>
                    </div>
                  ) : null}

                  {slot.compressionError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-destructive/85 px-3 text-center text-destructive-foreground">
                      <AlertCircle className="size-5" aria-hidden />
                      <span className="text-[11px] font-medium leading-snug">
                        Compression failed — remove and try again
                      </span>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => handleRemove(slot.localId)}
                    disabled={disabled}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm ring-1 ring-inset ring-border transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                  </button>

                  {!slot.compressing && !slot.compressionError ? (
                    <span
                      aria-hidden
                      className="absolute left-2 top-2 flex size-7 cursor-grab items-center justify-center rounded-full bg-background/95 text-muted-foreground shadow-sm ring-1 ring-inset ring-border active:cursor-grabbing"
                    >
                      <GripVertical className="size-3.5" />
                    </span>
                  ) : null}

                  {slot.sizeBytes !== undefined ? (
                    <span
                      data-tabular
                      className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-background/95 px-2 py-0.5 text-[10.5px] font-medium text-foreground/85 shadow-sm ring-1 ring-inset ring-border"
                    >
                      {formatKB(slot.sizeBytes)}
                    </span>
                  ) : null}
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
                    disabled={disabled || slot.compressing}
                    placeholder="Describe the photo"
                    maxLength={500}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-[12.5px] text-foreground outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
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
            {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} remaining ·
            compressed to ~400 KB before upload
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
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {dropError}
        </p>
      ) : null}
    </div>
  );
}
