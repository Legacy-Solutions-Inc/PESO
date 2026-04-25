import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PhotoEntry } from "@/lib/validations/news-post";
import type {
  EmploymentType,
  JobStatus,
} from "@/lib/validations/job-posting";

/**
 * Public-surface read helpers.
 *
 * RLS allows admins to read every row of news_posts and job_postings, so
 * we cannot lean on RLS alone to scope the public surface — an admin
 * browsing /, /news, /jobs would otherwise see drafts and expired
 * postings that the detail pages then 404 via the visibility predicate.
 * Every query below explicitly filters to anon-visible rows so the list
 * and detail surfaces stay consistent regardless of who is logged in.
 *
 * We also project only public-safe columns so admin user IDs
 * (`author_id`, `created_by`) never reach the client.
 */

function nowIso(): string {
  return new Date().toISOString();
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const NEWS_PUBLIC_COLS =
  "id, caption, photos, published_at, is_pinned, status, created_at";

const JOB_PUBLIC_COLS = `
  id, title, employer_name, description, location, employment_type,
  salary_range_min, salary_range_max, application_deadline,
  contact_email, contact_phone, status, posted_at, created_at, updated_at
`;

export interface PublicNewsPost {
  id: number;
  caption: string;
  photos: PhotoEntry[];
  published_at: string | null;
  is_pinned: boolean;
  /**
   * Always 'published' for anon callers (RLS filters), but admins reading
   * the same query may see other statuses — exposed so the visibility
   * predicate at /news/[id] can match RLS exactly.
   */
  status: string;
  created_at: string;
}

export interface PublicJobPosting {
  id: number;
  title: string;
  employer_name: string;
  description: string;
  location: string;
  employment_type: EmploymentType;
  salary_range_min: number | null;
  salary_range_max: number | null;
  application_deadline: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: JobStatus;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Most-recently-published pinned post that is currently visible to anon. */
export async function getPinnedNewsPost(): Promise<PublicNewsPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select(NEWS_PUBLIC_COLS)
    .eq("is_pinned", true)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getPinnedNewsPost error:", error.message);
    return null;
  }
  return (data ?? null) as PublicNewsPost | null;
}

/**
 * Most-recent published, non-pinned posts for the landing feed.
 * Pass `excludeId` to drop the pinned post if you also fetched it.
 */
export async function getLatestNewsPosts(
  limit: number,
  excludeId?: number,
): Promise<PublicNewsPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("news_posts")
    .select(NEWS_PUBLIC_COLS)
    .eq("is_pinned", false)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false })
    .limit(limit);
  if (excludeId !== undefined) {
    query = query.neq("id", excludeId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("getLatestNewsPosts error:", error.message);
    return [];
  }
  return (data ?? []) as PublicNewsPost[];
}

/** Page through the full public feed (pinned-first then chronological). */
export interface PaginatedNews {
  posts: PublicNewsPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listPublicNewsPaginated(
  page: number,
  pageSize: number,
): Promise<PaginatedNews> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
  const supabase = await createClient();
  const start = (safePage - 1) * safeSize;
  const { data, count, error } = await supabase
    .from("news_posts")
    .select(NEWS_PUBLIC_COLS, { count: "exact" })
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", nowIso())
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .range(start, start + safeSize - 1);
  if (error) {
    console.error("listPublicNewsPaginated error:", error.message);
    return {
      posts: [],
      total: 0,
      page: safePage,
      pageSize: safeSize,
      totalPages: 1,
    };
  }
  const total = count ?? 0;
  return {
    posts: (data ?? []) as PublicNewsPost[],
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}

/** Look up a single published post by id. Returns null if not visible. */
export async function getPublicNewsPostById(
  id: number,
): Promise<PublicNewsPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select(NEWS_PUBLIC_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getPublicNewsPostById error:", error.message);
    return null;
  }
  return (data ?? null) as PublicNewsPost | null;
}

/** Up to N active, not-past-deadline job postings ordered most-recent first. */
export async function getActiveJobs(limit: number): Promise<PublicJobPosting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select(JOB_PUBLIC_COLS)
    .eq("status", "active")
    .gte("application_deadline", todayIso())
    .order("posted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getActiveJobs error:", error.message);
    return [];
  }
  return (data ?? []) as PublicJobPosting[];
}

export interface PublicJobsFilters {
  page: number;
  pageSize: number;
  employmentType?: EmploymentType;
  locationKeyword?: string;
  deadlineWithinDays?: number;
}

export interface PaginatedJobs {
  jobs: PublicJobPosting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listPublicJobsPaginated(
  filters: PublicJobsFilters,
): Promise<PaginatedJobs> {
  const safePage = Math.max(1, Math.floor(filters.page));
  const safeSize = Math.max(1, Math.min(100, Math.floor(filters.pageSize)));
  const supabase = await createClient();

  let query = supabase
    .from("job_postings")
    .select(JOB_PUBLIC_COLS, { count: "exact" })
    // Anon-visibility floor: same predicate the detail page uses.
    .eq("status", "active")
    .gte("application_deadline", todayIso());

  if (filters.employmentType) {
    query = query.eq("employment_type", filters.employmentType);
  }
  if (filters.locationKeyword && filters.locationKeyword.trim() !== "") {
    query = query.ilike("location", `%${filters.locationKeyword.trim()}%`);
  }
  if (filters.deadlineWithinDays !== undefined) {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + filters.deadlineWithinDays);
    query = query.lte(
      "application_deadline",
      horizon.toISOString().slice(0, 10),
    );
  }

  query = query
    .order("posted_at", { ascending: false, nullsFirst: false })
    .order("application_deadline", { ascending: true });

  const start = (safePage - 1) * safeSize;
  query = query.range(start, start + safeSize - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error("listPublicJobsPaginated error:", error.message);
    return {
      jobs: [],
      total: 0,
      page: safePage,
      pageSize: safeSize,
      totalPages: 1,
    };
  }
  const total = count ?? 0;
  return {
    jobs: (data ?? []) as PublicJobPosting[],
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}

export async function getPublicJobById(
  id: number,
): Promise<PublicJobPosting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select(JOB_PUBLIC_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getPublicJobById error:", error.message);
    return null;
  }
  return (data ?? null) as PublicJobPosting | null;
}
