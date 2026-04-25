import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NEWS_CAPTION_MAX,
  NEWS_PHOTOS_MAX,
  NEWS_PHOTO_MAX_BYTES,
  newsPhotoMetaSchema,
  newsPostCreateSchema,
  newsPostInputSchema,
  photoEntrySchema,
} from "./news-post.ts";

describe("newsPostInputSchema", () => {
  const validBase = {
    caption: "Office holiday hours next week.",
    photos: [],
    is_pinned: false,
  };

  it("accepts a minimal valid input", () => {
    const result = newsPostInputSchema.safeParse(validBase);
    assert.equal(result.success, true);
  });

  it("rejects an empty caption (after trim)", () => {
    const result = newsPostInputSchema.safeParse({
      ...validBase,
      caption: "   ",
    });
    assert.equal(result.success, false);
  });

  it("rejects a caption longer than the max", () => {
    const result = newsPostInputSchema.safeParse({
      ...validBase,
      caption: "x".repeat(NEWS_CAPTION_MAX + 1),
    });
    assert.equal(result.success, false);
  });

  it("accepts a caption exactly at the max", () => {
    const result = newsPostInputSchema.safeParse({
      ...validBase,
      caption: "y".repeat(NEWS_CAPTION_MAX),
    });
    assert.equal(result.success, true);
  });

  it("accepts up to NEWS_PHOTOS_MAX photos", () => {
    const photos = Array.from({ length: NEWS_PHOTOS_MAX }, (_, i) => ({
      path: `news/1/${i}.jpg`,
      alt_text: "",
      display_order: i,
    }));
    const result = newsPostInputSchema.safeParse({ ...validBase, photos });
    assert.equal(result.success, true);
  });

  it("rejects more than NEWS_PHOTOS_MAX photos", () => {
    const photos = Array.from({ length: NEWS_PHOTOS_MAX + 1 }, (_, i) => ({
      path: `news/1/${i}.jpg`,
      alt_text: "",
      display_order: i,
    }));
    const result = newsPostInputSchema.safeParse({ ...validBase, photos });
    assert.equal(result.success, false);
  });
});

describe("photoEntrySchema", () => {
  it("rejects an empty path", () => {
    const result = photoEntrySchema.safeParse({
      path: "",
      alt_text: "",
      display_order: 0,
    });
    assert.equal(result.success, false);
  });

  it("rejects a non-integer display_order", () => {
    const result = photoEntrySchema.safeParse({
      path: "news/1/a.jpg",
      alt_text: "",
      display_order: 1.5,
    });
    assert.equal(result.success, false);
  });

  it("rejects display_order outside [0, NEWS_PHOTOS_MAX-1]", () => {
    const tooHigh = photoEntrySchema.safeParse({
      path: "news/1/a.jpg",
      alt_text: "",
      display_order: NEWS_PHOTOS_MAX,
    });
    assert.equal(tooHigh.success, false);
    const negative = photoEntrySchema.safeParse({
      path: "news/1/a.jpg",
      alt_text: "",
      display_order: -1,
    });
    assert.equal(negative.success, false);
  });
});

describe("newsPostCreateSchema", () => {
  it("only accepts caption and is_pinned", () => {
    const result = newsPostCreateSchema.safeParse({
      caption: "Valid",
      is_pinned: true,
      // Extra keys are ignored by default zod object parsing.
      photos: [],
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(result.data, "photos"),
        false,
      );
    }
  });
});

describe("newsPhotoMetaSchema", () => {
  const valid = {
    postId: 1,
    fileName: "photo.png",
    mimeType: "image/png",
    byteSize: 1024,
  };

  it("accepts a valid image", () => {
    assert.equal(newsPhotoMetaSchema.safeParse(valid).success, true);
  });

  it("rejects a non-image MIME type", () => {
    const result = newsPhotoMetaSchema.safeParse({
      ...valid,
      mimeType: "application/pdf",
    });
    assert.equal(result.success, false);
  });

  it("rejects a file larger than NEWS_PHOTO_MAX_BYTES", () => {
    const result = newsPhotoMetaSchema.safeParse({
      ...valid,
      byteSize: NEWS_PHOTO_MAX_BYTES + 1,
    });
    assert.equal(result.success, false);
  });

  it("rejects a non-positive postId", () => {
    const result = newsPhotoMetaSchema.safeParse({ ...valid, postId: 0 });
    assert.equal(result.success, false);
  });

  it("rejects an empty filename", () => {
    const result = newsPhotoMetaSchema.safeParse({ ...valid, fileName: "" });
    assert.equal(result.success, false);
  });
});
