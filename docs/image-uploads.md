# Image uploads

## The rule

**Every image uploaded to Supabase Storage from this project must run
through `lib/image/compress.ts` before the upload call.** Never upload
the raw user-selected `File`. The bucket is on the project's current
plan tier, so we do not have on-serve transformations — keeping the
bucket bytes-scale (≤ 400 KB per photo) is the client's job.

## Why

- Default WebP output at quality 0.8, max edge 1600 px, target 400 KB.
- Web Worker (`useWebWorker: true`) — the main thread stays responsive.
- A 4 MB iPhone JPEG lands in the bucket as a ~250 KB WebP.

## API

```ts
import {
  compressImage,
  compressNewsPhoto,
  CompressionError,
} from "@/lib/image/compress";
```

### `compressNewsPhoto(file)`

Use this for the admin news photo uploader. Thin wrapper around
`compressImage` with the news-photo defaults baked in.

```ts
const compressed = await compressNewsPhoto(file);
// upload `compressed`, not `file`
```

### `compressImage(file, options?)`

The generic primitive. Use this for any other surface (avatars, hero
images, attachments) and pass your own option overrides.

Defaults — also used by `compressNewsPhoto`:

| option                  | value          |
| ----------------------- | -------------- |
| `maxSizeMB`             | `0.4`          |
| `maxWidthOrHeight`      | `1600`         |
| `useWebWorker`          | `true`         |
| `fileType`              | `"image/webp"` |
| `initialQuality`        | `0.8`          |
| `alwaysKeepResolution`  | `false`        |

### `CompressionError`

Thrown for any non-recoverable failure. `code` is one of:

| code                          | meaning                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| `INVALID_TYPE`                | input `file.type` did not start with `image/`                          |
| `OVERSIZE_AFTER_COMPRESSION`  | result is still > 1 MB; surface as toast and abort the upload          |
| `ENCODING_FAILED`             | both WebP and JPEG paths threw inside `browser-image-compression`      |

Callers surface these as toasts. The util itself stays pure (no toast,
no router, no Supabase).

## Behavior contract

- Validates `file.type.startsWith("image/")` before invoking the lib.
- Tries WebP encoding first. On failure, retries once with JPEG; if
  both fail, throws `ENCODING_FAILED`.
- Rewrites the filename so the extension matches the actual output
  type (`.webp` or `.jpeg`).
- Rejects any post-compression result over 1 MB with
  `OVERSIZE_AFTER_COMPRESSION`.
- Never silently falls back to uploading the raw file.
- The original `File` is dropped from app state once compression
  succeeds (no IndexedDB, no temp bucket path, no form-state lingering).

## UI affordance

While `compressImage` is in flight, show a compact spinner and the
label *"Compressing image…"*. Switch to *"Uploading…"* once the upload
call starts. Disable the form's submit button during both phases. Web
Worker compression keeps the UI responsive — don't add artificial
delays.

After compression succeeds, show the resulting size next to each
thumbnail (`formatKB(bytes)`).

## Testing

`lib/image/compress.test.ts` exercises the wrapper logic with synthetic
runtime-generated `File`s. The real library is browser-only, so the
tests swap the underlying compressor via the `__setCompressorForTests`
hook — that hook is for tests only, never call it from production code.

A 4 MB sample iPhone JPEG run through `compressNewsPhoto` is verified
manually in dev once per release.
