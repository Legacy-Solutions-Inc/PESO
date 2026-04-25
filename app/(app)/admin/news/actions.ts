"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { writeAuditLog } from "@/lib/audit/write-audit-log";
import {
  newsPhotoMetaSchema,
  newsPostCreateSchema,
  newsPostIdSchema,
  newsPostInputSchema,
  type NewsPostStatus,
} from "@/lib/validations/news-post";
import type {
  AuditLogEntry,
  NewsListFilters,
  NewsListResult,
  NewsPostRow,
} from "@/lib/types/news-post";

const ENTITY_TYPE = "news_post";
const PUBLIC_MEDIA_BUCKET = "public-media";
const PHOTO_PATH_PREFIX = "news";
const SAFE_EXT = /^[a-z0-9]{2,8}$/;

// ---------------------------------------------------------------------
// Result envelope — discriminated by `error: null | string` so the
// success branch narrows to `{ data: T; error: null }` after a guard.
// ---------------------------------------------------------------------

type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string };

function ok<T>(data: T): Result<T> {
  return { data, error: null };
}
function fail(error: string): Result<never> {
  return { data: null, error };
}

interface AdminCtx {
  actorId: string;
  actorEmail: string;
}

async function getAdminContext(): Promise<Result<AdminCtx>> {
  const auth = await requireAdmin();
  if (auth.error || !auth.data) {
    return fail(auth.error ?? "Unauthorized");
  }
  if (!auth.data.user.email) {
    return fail("Actor email missing");
  }
  return ok({
    actorId: auth.data.user.id,
    actorEmail: auth.data.user.email,
  });
}

const newsListFiltersSchema = z.object({
  status: z
    .enum(["draft", "published", "archived", "all"])
    .optional(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
});

function revalidateNewsSurfaces(id?: number) {
  revalidatePath("/admin/news", "page");
  if (id !== undefined) {
    revalidatePath(`/admin/news/${id}/edit`, "page");
    revalidatePath(`/news/${id}`, "page");
  }
  revalidatePath("/news", "page");
  revalidatePath("/", "page");
}

// ---------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------

export async function listNewsPosts(
  filters: NewsListFilters,
): Promise<Result<NewsListResult>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const parsed = newsListFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid filters");
  }

  const { status, page, pageSize } = parsed.data;
  const supabase = await createClient();

  let query = supabase
    .from("news_posts")
    .select("*", { count: "exact" });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  query = query
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("listNewsPosts error:", error.message);
    return fail(error.message);
  }

  const total = count ?? 0;
  return ok({
    posts: (data ?? []) as NewsPostRow[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function getNewsPostById(
  id: number,
): Promise<Result<NewsPostRow>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid news post id");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", idResult.data)
    .single();

  if (error) {
    if (error.code === "PGRST116") return fail("Not found");
    console.error("getNewsPostById error:", error.message);
    return fail(error.message);
  }
  return ok(data as NewsPostRow);
}

export async function getNewsActivity(
  id: number,
): Promise<Result<AuditLogEntry[]>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid news post id");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, actor_email, action, metadata, created_at")
    .eq("entity_type", ENTITY_TYPE)
    .eq("entity_id", idResult.data)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getNewsActivity error:", error.message);
    return fail(error.message);
  }
  return ok((data ?? []) as AuditLogEntry[]);
}

// ---------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------

export async function createNewsPost(
  input: unknown,
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const parsed = newsPostCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news_posts")
    .insert({
      caption: parsed.data.caption,
      is_pinned: parsed.data.is_pinned,
      status: "draft",
      photos: [],
      author_id: auth.data.actorId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createNewsPost error:", error?.message);
    return fail(error?.message ?? "Failed to create news post");
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action: "CREATE_NEWS_POST",
    entityType: ENTITY_TYPE,
    entityId: data.id,
  });

  revalidateNewsSurfaces(data.id);
  return ok({ id: data.id });
}

export async function updateNewsPost(
  id: number,
  input: unknown,
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid news post id");

  const parsed = newsPostInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // Server-side path-shape check: every photo path must live under
  // `news/{post_id}/`. The migration's CHECK only enforces array shape.
  const expectedPrefix = `${PHOTO_PATH_PREFIX}/${idResult.data}/`;
  for (const photo of parsed.data.photos) {
    if (!photo.path.startsWith(expectedPrefix)) {
      return fail(
        `Photo path must live under ${expectedPrefix}; got ${photo.path}`,
      );
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_posts")
    .update({
      caption: parsed.data.caption,
      is_pinned: parsed.data.is_pinned,
      photos: parsed.data.photos,
    })
    .eq("id", idResult.data);

  if (error) {
    console.error("updateNewsPost error:", error.message);
    return fail(error.message);
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action: "UPDATE_NEWS_POST",
    entityType: ENTITY_TYPE,
    entityId: idResult.data,
  });

  revalidateNewsSurfaces(idResult.data);
  return ok({ id: idResult.data });
}

async function transitionStatus(
  id: number,
  toStatus: NewsPostStatus,
  action:
    | "PUBLISH_NEWS_POST"
    | "UNPUBLISH_NEWS_POST"
    | "ARCHIVE_NEWS_POST",
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid news post id");

  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("news_posts")
    .select("status, published_at")
    .eq("id", idResult.data)
    .single();
  if (fetchError || !current) {
    if (fetchError?.code === "PGRST116") return fail("Not found");
    return fail(fetchError?.message ?? "Failed to read post");
  }

  const update: Record<string, unknown> = { status: toStatus };
  // First publish stamps published_at; subsequent transitions leave it intact.
  if (toStatus === "published" && current.published_at === null) {
    update.published_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("news_posts")
    .update(update)
    .eq("id", idResult.data);

  if (updateError) {
    console.error(`${action} error:`, updateError.message);
    return fail(updateError.message);
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action,
    entityType: ENTITY_TYPE,
    entityId: idResult.data,
    metadata: { from: current.status, to: toStatus },
  });

  revalidateNewsSurfaces(idResult.data);
  return ok({ id: idResult.data });
}

export async function publishNewsPost(id: number) {
  return transitionStatus(id, "published", "PUBLISH_NEWS_POST");
}

export async function unpublishNewsPost(id: number) {
  return transitionStatus(id, "draft", "UNPUBLISH_NEWS_POST");
}

export async function archiveNewsPost(id: number) {
  return transitionStatus(id, "archived", "ARCHIVE_NEWS_POST");
}

async function setPinned(
  id: number,
  pinned: boolean,
  action: "PIN_NEWS_POST" | "UNPIN_NEWS_POST",
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid news post id");

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_posts")
    .update({ is_pinned: pinned })
    .eq("id", idResult.data);

  if (error) {
    console.error(`${action} error:`, error.message);
    return fail(error.message);
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action,
    entityType: ENTITY_TYPE,
    entityId: idResult.data,
  });

  revalidateNewsSurfaces(idResult.data);
  return ok({ id: idResult.data });
}

export async function pinNewsPost(id: number) {
  return setPinned(id, true, "PIN_NEWS_POST");
}

export async function unpinNewsPost(id: number) {
  return setPinned(id, false, "UNPIN_NEWS_POST");
}

export async function deleteNewsPost(
  id: number,
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid news post id");

  const supabase = await createClient();

  // Best-effort: clear orphaned photos from the storage bucket. We list
  // the post's prefix and delete what's there; failures are logged but
  // do not block the row delete (the photos become unreferenced anyway).
  const folder = `${PHOTO_PATH_PREFIX}/${idResult.data}`;
  const { data: objects } = await supabase
    .storage
    .from(PUBLIC_MEDIA_BUCKET)
    .list(folder);
  if (objects && objects.length > 0) {
    const paths = objects.map((o) => `${folder}/${o.name}`);
    const { error: removeError } = await supabase
      .storage
      .from(PUBLIC_MEDIA_BUCKET)
      .remove(paths);
    if (removeError) {
      console.error(
        "deleteNewsPost storage cleanup warning:",
        removeError.message,
      );
    }
  }

  const { error } = await supabase
    .from("news_posts")
    .delete()
    .eq("id", idResult.data);

  if (error) {
    console.error("deleteNewsPost error:", error.message);
    return fail(error.message);
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action: "DELETE_NEWS_POST",
    entityType: ENTITY_TYPE,
    entityId: idResult.data,
  });

  revalidateNewsSurfaces(idResult.data);
  return ok({ id: idResult.data });
}

// ---------------------------------------------------------------------
// Photo upload
// ---------------------------------------------------------------------

/**
 * Upload one image into `public-media/news/{postId}/{uuid}.{ext}`.
 * Caller passes a FormData with `postId` (string-numeric) and `file` (File).
 * Returns the resulting object path so the client can append it to the
 * post's photos array on the next save.
 *
 * No audit_log row is written here — the photo upload alone does not
 * change the post; the eventual `updateNewsPost` call records the change.
 */
export async function uploadNewsPhoto(
  formData: FormData,
): Promise<Result<{ path: string }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const file = formData.get("file");
  const postIdRaw = formData.get("postId");

  if (!(file instanceof File)) return fail("Missing file");

  const meta = newsPhotoMetaSchema.safeParse({
    postId: Number(postIdRaw),
    fileName: file.name,
    mimeType: file.type,
    byteSize: file.size,
  });
  if (!meta.success) {
    return fail(meta.error.issues[0]?.message ?? "Invalid file");
  }

  const supabase = await createClient();

  // Confirm the post exists and the admin can read it.
  const { error: fetchError } = await supabase
    .from("news_posts")
    .select("id")
    .eq("id", meta.data.postId)
    .single();
  if (fetchError) {
    if (fetchError.code === "PGRST116") return fail("Post not found");
    return fail(fetchError.message);
  }

  const ext = (meta.data.fileName.split(".").pop() ?? "").toLowerCase();
  const safeExt = SAFE_EXT.test(ext) ? ext : "bin";
  const filename = `${crypto.randomUUID()}.${safeExt}`;
  const path = `${PHOTO_PATH_PREFIX}/${meta.data.postId}/${filename}`;

  const { error: uploadError } = await supabase
    .storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(path, file, {
      contentType: meta.data.mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("uploadNewsPhoto error:", uploadError.message);
    return fail(uploadError.message);
  }

  return ok({ path });
}

/**
 * Delete one photo object by path. Used by the editor when the admin
 * removes a photo from a post before saving. Path must be inside the
 * post's prefix; we validate that before touching storage.
 */
export async function deleteNewsPhoto(
  postId: number,
  path: string,
): Promise<Result<{ path: string }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = newsPostIdSchema.safeParse(postId);
  if (!idResult.success) return fail("Invalid news post id");

  const expectedPrefix = `${PHOTO_PATH_PREFIX}/${idResult.data}/`;
  if (typeof path !== "string" || !path.startsWith(expectedPrefix)) {
    return fail(`Invalid path: must live under ${expectedPrefix}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .storage
    .from(PUBLIC_MEDIA_BUCKET)
    .remove([path]);

  if (error) {
    console.error("deleteNewsPhoto error:", error.message);
    return fail(error.message);
  }

  return ok({ path });
}
