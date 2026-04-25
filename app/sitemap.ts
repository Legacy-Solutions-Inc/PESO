import type { MetadataRoute } from "next";
import { listPublicNewsPaginated, listPublicJobsPaginated } from "@/app/(public)/_data/queries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://peso-lambunao.example.gov.ph";

const STATIC_ENTRIES: MetadataRoute.Sitemap = [
  {
    url: `${SITE_URL}/`,
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_URL}/news`,
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/jobs`,
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/privacy`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pull a generous page of each so the sitemap reflects current visible
  // content. Anon-side helpers already filter to published-and-current.
  const [newsResult, jobsResult] = await Promise.all([
    listPublicNewsPaginated(1, 100).catch(() => ({
      posts: [] as Array<{
        id: number;
        published_at: string | null;
        created_at: string;
      }>,
    })),
    listPublicJobsPaginated({ page: 1, pageSize: 100 }).catch(() => ({
      jobs: [] as Array<{
        id: number;
        updated_at: string;
        posted_at: string | null;
      }>,
    })),
  ]);

  const newsEntries: MetadataRoute.Sitemap = (newsResult.posts ?? []).map(
    (p) => ({
      url: `${SITE_URL}/news/${p.id}`,
      lastModified: p.published_at ?? p.created_at,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const jobEntries: MetadataRoute.Sitemap = (jobsResult.jobs ?? []).map(
    (j) => ({
      url: `${SITE_URL}/jobs/${j.id}`,
      lastModified: j.updated_at ?? j.posted_at ?? undefined,
      changeFrequency: "daily",
      priority: 0.7,
    })
  );

  return [...STATIC_ENTRIES, ...newsEntries, ...jobEntries];
}
