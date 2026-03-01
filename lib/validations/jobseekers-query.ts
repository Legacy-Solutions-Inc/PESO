import { z } from "zod";

const PAGE_SIZE_DEFAULT = 20;

export const jobseekersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().optional(),
  sex: z.string().optional(),
  employmentStatus: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  barangay: z.string().optional(),
  isOfw: z.string().optional(),
  is4PsBeneficiary: z.string().optional(),
  civilStatus: z.string().optional(),
  ageMin: z.string().optional(),
  ageMax: z.string().optional(),
  employedType: z.string().optional(),
  unemployedReason: z.string().optional(),
  employmentType: z.string().optional(),
  occupation1: z.string().optional(),
  tertiaryCourse: z.string().optional(),
});

export type JobseekersQuery = z.infer<typeof jobseekersQuerySchema>;

export const JOBSEEKERS_PAGE_SIZE = PAGE_SIZE_DEFAULT;

/** Normalize Next.js searchParams (string | string[] | undefined) to Record<string, string> for Zod. */
function normalizeSearchParams(
  params: Record<string, string | string[] | undefined> | unknown
): Record<string, string> {
  if (params === null || typeof params !== "object" || Array.isArray(params)) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const single = Array.isArray(value) ? value[0] : value;
    if (single !== undefined) result[key] = String(single);
  }
  return result;
}

export function parseJobseekersQuery(
  params: unknown
): { page: number; pageSize: number; filters: Omit<JobseekersQuery, "page"> } {
  const normalized = normalizeSearchParams(
    params as Record<string, string | string[] | undefined>
  );
  const parsed = jobseekersQuerySchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      page: 1,
      pageSize: PAGE_SIZE_DEFAULT,
      filters: {},
    };
  }
  const { page, ...filters } = parsed.data;
  return {
    page,
    pageSize: PAGE_SIZE_DEFAULT,
    filters,
  };
}
