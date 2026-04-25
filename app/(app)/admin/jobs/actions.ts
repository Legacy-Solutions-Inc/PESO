"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { writeAuditLog } from "@/lib/audit/write-audit-log";
import {
  jobPostingIdSchema,
  jobPostingInputSchema,
  type JobStatus,
} from "@/lib/validations/job-posting";
import type {
  JobListFilters,
  JobListResult,
  JobPostingRow,
} from "@/lib/types/job-posting";
import type { AuditLogEntry } from "@/lib/types/news-post";

const ENTITY_TYPE = "job_posting";

// ---------------------------------------------------------------------
// Result envelope (matches admin/news/actions.ts).
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

const jobListFiltersSchema = z.object({
  status: z.enum(["draft", "active", "closed", "archived", "all"]).optional(),
  deadlineWithinDays: z
    .number()
    .int()
    .positive()
    .max(365)
    .optional(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
});

function revalidateJobSurfaces(id?: number) {
  revalidatePath("/admin/jobs", "page");
  if (id !== undefined) {
    revalidatePath(`/admin/jobs/${id}/edit`, "page");
    revalidatePath(`/jobs/${id}`, "page");
  }
  revalidatePath("/jobs", "page");
  revalidatePath("/", "page");
}

function isoDateNDaysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------

export async function listJobPostings(
  filters: JobListFilters,
): Promise<Result<JobListResult>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const parsed = jobListFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid filters");
  }

  const { status, deadlineWithinDays, page, pageSize } = parsed.data;
  const supabase = await createClient();

  let query = supabase
    .from("job_postings")
    .select("*", { count: "exact" });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (deadlineWithinDays !== undefined) {
    const today = new Date().toISOString().slice(0, 10);
    const horizon = isoDateNDaysAhead(deadlineWithinDays);
    query = query.gte("application_deadline", today).lte(
      "application_deadline",
      horizon,
    );
  }

  query = query
    .order("posted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("listJobPostings error:", error.message);
    return fail(error.message);
  }

  const total = count ?? 0;
  return ok({
    jobs: (data ?? []) as JobPostingRow[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function getJobPostingById(
  id: number,
): Promise<Result<JobPostingRow>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = jobPostingIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid job posting id");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", idResult.data)
    .single();

  if (error) {
    if (error.code === "PGRST116") return fail("Not found");
    console.error("getJobPostingById error:", error.message);
    return fail(error.message);
  }
  return ok(data as JobPostingRow);
}

export async function getJobActivity(
  id: number,
): Promise<Result<AuditLogEntry[]>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = jobPostingIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid job posting id");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, actor_email, action, metadata, created_at")
    .eq("entity_type", ENTITY_TYPE)
    .eq("entity_id", idResult.data)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getJobActivity error:", error.message);
    return fail(error.message);
  }
  return ok((data ?? []) as AuditLogEntry[]);
}

// ---------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------

export async function createJobPosting(
  input: unknown,
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const parsed = jobPostingInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .insert({
      title: parsed.data.title,
      employer_name: parsed.data.employer_name,
      description: parsed.data.description,
      location: parsed.data.location,
      employment_type: parsed.data.employment_type,
      salary_range_min: parsed.data.salary_range_min,
      salary_range_max: parsed.data.salary_range_max,
      application_deadline: parsed.data.application_deadline,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone,
      status: "draft",
      created_by: auth.data.actorId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createJobPosting error:", error?.message);
    return fail(error?.message ?? "Failed to create job posting");
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action: "CREATE_JOB_POSTING",
    entityType: ENTITY_TYPE,
    entityId: data.id,
  });

  revalidateJobSurfaces(data.id);
  return ok({ id: data.id });
}

export async function updateJobPosting(
  id: number,
  input: unknown,
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = jobPostingIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid job posting id");

  const parsed = jobPostingInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_postings")
    .update({
      title: parsed.data.title,
      employer_name: parsed.data.employer_name,
      description: parsed.data.description,
      location: parsed.data.location,
      employment_type: parsed.data.employment_type,
      salary_range_min: parsed.data.salary_range_min,
      salary_range_max: parsed.data.salary_range_max,
      application_deadline: parsed.data.application_deadline,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone,
    })
    .eq("id", idResult.data);

  if (error) {
    console.error("updateJobPosting error:", error.message);
    return fail(error.message);
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action: "UPDATE_JOB_POSTING",
    entityType: ENTITY_TYPE,
    entityId: idResult.data,
  });

  revalidateJobSurfaces(idResult.data);
  return ok({ id: idResult.data });
}

async function transitionStatus(
  id: number,
  toStatus: JobStatus,
  action:
    | "ACTIVATE_JOB_POSTING"
    | "CLOSE_JOB_POSTING"
    | "ARCHIVE_JOB_POSTING",
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = jobPostingIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid job posting id");

  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("job_postings")
    .select("status, posted_at")
    .eq("id", idResult.data)
    .single();
  if (fetchError || !current) {
    if (fetchError?.code === "PGRST116") return fail("Not found");
    return fail(fetchError?.message ?? "Failed to read job posting");
  }

  const update: Record<string, unknown> = { status: toStatus };
  // First activation stamps posted_at; subsequent transitions leave it.
  if (toStatus === "active" && current.posted_at === null) {
    update.posted_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("job_postings")
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

  revalidateJobSurfaces(idResult.data);
  return ok({ id: idResult.data });
}

export async function activateJobPosting(id: number) {
  return transitionStatus(id, "active", "ACTIVATE_JOB_POSTING");
}

export async function closeJobPosting(id: number) {
  return transitionStatus(id, "closed", "CLOSE_JOB_POSTING");
}

export async function archiveJobPosting(id: number) {
  return transitionStatus(id, "archived", "ARCHIVE_JOB_POSTING");
}

export async function deleteJobPosting(
  id: number,
): Promise<Result<{ id: number }>> {
  const auth = await getAdminContext();
  if (!auth.data) return auth;

  const idResult = jobPostingIdSchema.safeParse(id);
  if (!idResult.success) return fail("Invalid job posting id");

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_postings")
    .delete()
    .eq("id", idResult.data);

  if (error) {
    console.error("deleteJobPosting error:", error.message);
    return fail(error.message);
  }

  await writeAuditLog(supabase, {
    actorId: auth.data.actorId,
    actorEmail: auth.data.actorEmail,
    action: "DELETE_JOB_POSTING",
    entityType: ENTITY_TYPE,
    entityId: idResult.data,
  });

  revalidateJobSurfaces(idResult.data);
  return ok({ id: idResult.data });
}
