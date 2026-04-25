import { z } from "zod";

/**
 * Validation schemas for news_posts. Shared between the admin compose form
 * (RHF resolver) and the Server Actions (defence-in-depth parse before
 * touching Supabase). The migration's shape constraints are intentionally
 * shallow — the deep checks (photo entry shape, allowed status set, etc.)
 * live here.
 */

export const NEWS_CAPTION_MIN = 1;
export const NEWS_CAPTION_MAX = 5000;
export const NEWS_PHOTOS_MAX = 10;

export const newsPostStatusSchema = z.enum([
  "draft",
  "published",
  "archived",
]);
export type NewsPostStatus = z.infer<typeof newsPostStatusSchema>;

/**
 * One photo entry as stored in `news_posts.photos`.
 * `path` must point inside the bucket prefix `news/{post_id}/...` — that
 * shape check happens in the Server Action where post_id is in scope.
 */
export const photoEntrySchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Photo path is required")
    .max(500, "Photo path is too long"),
  alt_text: z.string().trim().max(500, "Alt text is too long"),
  display_order: z
    .number()
    .int()
    .min(0)
    .max(NEWS_PHOTOS_MAX - 1),
});
export type PhotoEntry = z.infer<typeof photoEntrySchema>;

/** Fields the admin can edit through the compose form. */
export const newsPostInputSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(NEWS_CAPTION_MIN, "Caption is required")
    .max(NEWS_CAPTION_MAX, `Caption must be at most ${NEWS_CAPTION_MAX} characters`),
  photos: z
    .array(photoEntrySchema)
    .max(NEWS_PHOTOS_MAX, `Up to ${NEWS_PHOTOS_MAX} photos per post`),
  is_pinned: z.boolean(),
});
export type NewsPostInput = z.infer<typeof newsPostInputSchema>;

/** Initial draft allocation — photos start empty (uploaded after id exists). */
export const newsPostCreateSchema = newsPostInputSchema.pick({
  caption: true,
  is_pinned: true,
});
export type NewsPostCreate = z.infer<typeof newsPostCreateSchema>;

/** Numeric id parameter shape for actions that target a single post. */
export const newsPostIdSchema = z
  .number()
  .int()
  .positive("News post id must be a positive integer");

/** Allowed image MIME types for the photo uploader. */
export const NEWS_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export const NEWS_PHOTO_MAX_BYTES = 4 * 1024 * 1024; // 4 MB.

export const newsPhotoMetaSchema = z.object({
  postId: newsPostIdSchema,
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.enum(NEWS_PHOTO_MIME_TYPES),
  byteSize: z
    .number()
    .int()
    .min(1)
    .max(
      NEWS_PHOTO_MAX_BYTES,
      `Each photo must be at most ${Math.round(NEWS_PHOTO_MAX_BYTES / 1024 / 1024)} MB`,
    ),
});
export type NewsPhotoMeta = z.infer<typeof newsPhotoMetaSchema>;
