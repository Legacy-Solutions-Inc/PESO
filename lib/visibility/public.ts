/**
 * Public-surface visibility predicates. Mirror the RLS policies so the
 * page-level `notFound()` matches what RLS would hide for an anon
 * Supabase client. Pure functions so they can be unit-tested without
 * touching the database.
 */

/**
 * A news post is visible to anon iff status='published' AND
 * published_at IS NOT NULL AND published_at <= now().
 */
export function isNewsPostPublic(
  status: string,
  publishedAt: string | null,
  now: Date = new Date(),
): boolean {
  if (status !== "published") return false;
  if (!publishedAt) return false;
  const ts = Date.parse(publishedAt);
  if (Number.isNaN(ts)) return false;
  return ts <= now.getTime();
}

/**
 * A job posting is visible to anon iff status='active' AND
 * application_deadline >= today (date comparison only).
 *
 * `applicationDeadline` is a YYYY-MM-DD string from Supabase; comparing
 * as strings works because lexicographic order matches calendar order.
 */
export function isJobPostingPublic(
  status: string,
  applicationDeadline: string,
  today: string = new Date().toISOString().slice(0, 10),
): boolean {
  if (status !== "active") return false;
  return applicationDeadline >= today;
}
