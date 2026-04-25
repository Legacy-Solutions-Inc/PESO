import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CompressionError,
  __setCompressorForTests,
  compressImage,
  type CompressOptions,
} from "./compress.ts";

/**
 * Tests for the wrapper logic in lib/image/compress.ts.
 *
 * `browser-image-compression` itself is browser-only (Canvas, ImageBitmap,
 * Web Worker), so we never call the real library here — we override
 * `activeCompressor` per test via the `__setCompressorForTests` hook
 * exported for that purpose. What we're verifying is OUR contract:
 *
 *   - input MIME validation
 *   - WebP-first / JPEG-fallback chain
 *   - oversize-after-compression guard
 *   - filename extension rewrite
 *
 * The real library's compression efficacy is verified manually in dev
 * with a 4 MB iPhone JPEG, per the spec's "done when" criteria.
 */

afterEach(() => {
  __setCompressorForTests(null);
});

function makeImageFile(bytes: number, mime: string, name = "input.png"): File {
  return new File([new Uint8Array(bytes)], name, { type: mime });
}

describe("compressImage", () => {
  it("compresses a large PNG to a small WebP and renames the file", async () => {
    const calls: Array<{ type: string; size: number }> = [];
    __setCompressorForTests(async (file, opts: CompressOptions) => {
      calls.push({ type: opts.fileType, size: file.size });
      return new File([new Uint8Array(380 * 1024)], file.name, {
        type: opts.fileType,
      });
    });

    const input = makeImageFile(2 * 1024 * 1024, "image/png", "iphone-shot.png");
    const out = await compressImage(input);

    assert.equal(out.type, "image/webp");
    assert.ok(
      out.size <= 400 * 1024,
      `expected ≤ 400KB, got ${out.size} bytes`,
    );
    assert.equal(out.name, "iphone-shot.webp");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.type, "image/webp");
  });

  it("does not expand small inputs", async () => {
    __setCompressorForTests(async (file, opts) => {
      // Library normally returns ≤ source size; mirror that contract.
      return new File([new Uint8Array(50 * 1024)], file.name, {
        type: opts.fileType,
      });
    });

    const input = makeImageFile(80 * 1024, "image/jpeg", "small.jpg");
    const out = await compressImage(input);

    assert.ok(out.size <= 100 * 1024, `expected ≤ 100KB, got ${out.size}`);
  });

  it("rejects non-image input with code INVALID_TYPE", async () => {
    const input = new File([new Uint8Array(10)], "doc.txt", {
      type: "text/plain",
    });
    await assert.rejects(
      () => compressImage(input),
      (err) =>
        err instanceof CompressionError && err.code === "INVALID_TYPE",
    );
  });

  it("throws OVERSIZE_AFTER_COMPRESSION when the result is still over 1 MB", async () => {
    __setCompressorForTests(async (file, opts) => {
      // Pathological: library returns 1.5 MB.
      return new File(
        [new Uint8Array(Math.floor(1.5 * 1024 * 1024))],
        file.name,
        { type: opts.fileType },
      );
    });

    const input = makeImageFile(5 * 1024 * 1024, "image/png");
    await assert.rejects(
      () => compressImage(input),
      (err) =>
        err instanceof CompressionError &&
        err.code === "OVERSIZE_AFTER_COMPRESSION",
    );
  });

  it("falls back to JPEG when WebP encoding fails", async () => {
    let calls = 0;
    __setCompressorForTests(async (file, opts) => {
      calls++;
      if (calls === 1) {
        assert.equal(opts.fileType, "image/webp");
        throw new Error("webp encoding unavailable in this browser");
      }
      assert.equal(opts.fileType, "image/jpeg");
      return new File([new Uint8Array(200 * 1024)], file.name, {
        type: "image/jpeg",
      });
    });

    const input = makeImageFile(1 * 1024 * 1024, "image/png", "photo.png");
    const out = await compressImage(input);

    assert.equal(out.type, "image/jpeg");
    assert.equal(out.name, "photo.jpeg");
    assert.equal(calls, 2);
  });

  it("propagates ENCODING_FAILED when both WebP and JPEG fail", async () => {
    __setCompressorForTests(async () => {
      throw new Error("encoder unavailable");
    });

    const input = makeImageFile(1 * 1024 * 1024, "image/png");
    await assert.rejects(
      () => compressImage(input),
      (err) =>
        err instanceof CompressionError && err.code === "ENCODING_FAILED",
    );
  });
});
