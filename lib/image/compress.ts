/**
 * Client-side image compression for Supabase Storage uploads.
 *
 * Every photo uploaded from this project must run through this util
 * before hitting the bucket — that contract keeps the public-media
 * bucket bytes-scale (≤ 400 KB) instead of megabytes-scale, which
 * matters because the project does not have on-serve image
 * transformations.
 *
 * The wrapper is pure: no toast, no router, no Supabase. Callers
 * surface failures to the user. The compression itself runs in a Web
 * Worker (`useWebWorker: true`), keeping the main thread responsive.
 *
 * Public API:
 *   - {@link compressImage}         generic primitive
 *   - {@link compressNewsPhoto}     news-photo defaults wrapper
 *   - {@link CompressionError}      typed error with three known codes
 *   - {@link NEWS_PHOTO_DEFAULTS}   the news-photo option preset
 */

/** Subset of `browser-image-compression`'s option shape that we expose. */
export interface CompressOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType: string;
  initialQuality: number;
  alwaysKeepResolution: boolean;
}

/**
 * Defaults applied by {@link compressImage} when called without an
 * options override. Also the exact preset {@link compressNewsPhoto}
 * uses. These numbers come from the project owner's prior research on
 * Supabase-compatible client-side compressors.
 */
export const NEWS_PHOTO_DEFAULTS: CompressOptions = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: "image/webp",
  initialQuality: 0.8,
  alwaysKeepResolution: false,
};

/**
 * Hard ceiling enforced after the library returns. If the result is
 * still above this size, we surface OVERSIZE_AFTER_COMPRESSION rather
 * than uploading something the bucket may reject and that defeats the
 * whole point of compressing.
 */
const POST_COMPRESSION_HARD_CAP_BYTES = 1 * 1024 * 1024;

export type CompressionErrorCode =
  | "INVALID_TYPE"
  | "OVERSIZE_AFTER_COMPRESSION"
  | "ENCODING_FAILED";

export class CompressionError extends Error {
  readonly code: CompressionErrorCode;
  constructor(code: CompressionErrorCode, message: string) {
    super(message);
    this.name = "CompressionError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------
// Internal compressor indirection
//
// `compressImage` calls `activeCompressor`, which by default lazy-loads
// `browser-image-compression`. The lazy import keeps the library out of
// Node module evaluation when these tests run under `node --test`. Tests
// override `activeCompressor` via the `__setCompressorForTests` hook so
// the real library is never invoked during unit tests; only our wrapper
// logic (validation, fallback, oversize check, filename rewrite) is
// exercised. For the real-photo verification the caller noted in the
// completion criteria, the default compressor runs in the browser as
// usual.
// ---------------------------------------------------------------------

type CompressorFn = (file: File, options: CompressOptions) => Promise<File>;

const defaultCompressor: CompressorFn = async (file, options) => {
  const { default: imageCompression } = await import(
    "browser-image-compression"
  );
  return imageCompression(file, options);
};

let activeCompressor: CompressorFn = defaultCompressor;

/**
 * Test-only hook. Pass a function to swap the underlying library call,
 * or `null` to restore the real compressor. Production code MUST NOT
 * call this.
 *
 * @internal
 */
export function __setCompressorForTests(fn: CompressorFn | null): void {
  activeCompressor = fn ?? defaultCompressor;
}

// ---------------------------------------------------------------------
// File-name and MIME helpers
// ---------------------------------------------------------------------

const MIME_TO_EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
};

function extensionFor(mime: string): string {
  return MIME_TO_EXT[mime] ?? "bin";
}

function withExtension(name: string, mime: string): string {
  const ext = extensionFor(mime);
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

/**
 * Wrap the library result in a fresh `File` so the filename matches the
 * actual output type. Callers that route the result back into a
 * Storage path use this for the extension.
 */
function rewrapFile(file: File, mime: string): File {
  return new File([file], withExtension(file.name, mime), {
    type: mime,
    lastModified: file.lastModified,
  });
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/**
 * Compress one image, defaulting to WebP at 400 KB / 1600 px / quality
 * 0.8 in a Web Worker. Throws a {@link CompressionError} with one of
 * three codes; never returns an oversized result.
 *
 * Fallback chain: if the requested `fileType` is `image/webp` and the
 * library throws, we retry once with `image/jpeg`. Any other primary
 * failure surfaces as ENCODING_FAILED.
 */
export async function compressImage(
  file: File,
  options?: Partial<CompressOptions>,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new CompressionError(
      "INVALID_TYPE",
      `Only image files can be compressed; received "${file.type || "unknown"}".`,
    );
  }

  const merged: CompressOptions = { ...NEWS_PHOTO_DEFAULTS, ...options };

  let result: File;
  try {
    result = await activeCompressor(file, merged);
  } catch (firstError) {
    const canFallback = merged.fileType === "image/webp";
    if (!canFallback) {
      throw new CompressionError(
        "ENCODING_FAILED",
        `Could not encode image: ${describe(firstError)}`,
      );
    }
    try {
      result = await activeCompressor(file, {
        ...merged,
        fileType: "image/jpeg",
      });
    } catch (secondError) {
      throw new CompressionError(
        "ENCODING_FAILED",
        `Could not encode image (webp + jpeg both failed): ${describe(secondError)}`,
      );
    }
  }

  // Some browsers/library versions return a Blob without a fully
  // populated `type` field. Trust the requested type when missing.
  const outMime =
    result.type && result.type !== ""
      ? result.type
      : merged.fileType;

  const renamed = rewrapFile(result, outMime);

  if (renamed.size > POST_COMPRESSION_HARD_CAP_BYTES) {
    const actualKB = Math.round(renamed.size / 1024);
    throw new CompressionError(
      "OVERSIZE_AFTER_COMPRESSION",
      `Compressed image is still over 1 MB (${actualKB} KB) — source may be unusually complex. Try a smaller or simpler image.`,
    );
  }

  return renamed;
}

/**
 * News-photo wrapper. Other surfaces (avatars, hero images, etc.)
 * should call {@link compressImage} directly with their own options.
 */
export function compressNewsPhoto(file: File): Promise<File> {
  return compressImage(file, NEWS_PHOTO_DEFAULTS);
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function describe(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
