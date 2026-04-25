import type { NewsPostStatus, PhotoEntry } from "@/lib/validations/news-post";

/** Shape of a news_posts row as returned by Supabase / Server Actions. */
export interface NewsPostRow {
  id: number;
  caption: string;
  photos: PhotoEntry[];
  status: NewsPostStatus;
  is_pinned: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

/** Filter set for the admin /admin/news listing. */
export interface NewsListFilters {
  status?: NewsPostStatus | "all";
  page: number;
  pageSize: number;
}

export interface NewsListResult {
  posts: NewsPostRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Audit log row, projected for the activity tab. */
export interface AuditLogEntry {
  id: number;
  actor_email: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
