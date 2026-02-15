"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import type { JobseekerRegistrationData } from "@/lib/validations/jobseeker-registration";
import { sanitizeSearchQuery } from "./search-utils";
import { generateJobseekersCSV } from "./export-logic";

export interface JobseekerFilters {
  // Quick search (indexed fields)
  search?: string;
  sex?: string;
  employmentStatus?: string;
  city?: string;
  province?: string;
  barangay?: string;
  isOfw?: string;
  is4PsBeneficiary?: string;
  
  // Advanced filters (JSONB queries)
  civilStatus?: string;
  ageMin?: string;
  ageMax?: string;
  
  // Education
  educationLevel?: string;
  tertiaryCourse?: string;
  
  // Employment details
  employedType?: string;
  unemployedReason?: string;
  
  // Job preference
  employmentType?: string;
  occupation1?: string;
  
  // Skills
  skills?: string;
  
  // Training
  hasCertificates?: string;
  
  // Pagination & sorting
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface JobseekerRecord {
  id: number;
  surname: string;
  first_name: string;
  sex: string;
  employment_status: string;
  city: string;
  province: string;
  is_ofw: boolean;
  is_4ps_beneficiary: boolean;
  created_at: string;
  personal_info: JobseekerRegistrationData["personalInfo"];
  employment: JobseekerRegistrationData["employment"];
  job_preference: JobseekerRegistrationData["jobPreference"];
  skills: JobseekerRegistrationData["skills"];
}

interface GetJobseekersResult {
  jobseekers: JobseekerRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Full jobseeker row for profile view (all JSONB + system fields). */
export interface JobseekerFullRecord {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: string;
  personal_info: JobseekerRegistrationData["personalInfo"];
  employment: JobseekerRegistrationData["employment"];
  job_preference: JobseekerRegistrationData["jobPreference"];
  language: JobseekerRegistrationData["language"];
  education: JobseekerRegistrationData["education"];
  training: JobseekerRegistrationData["training"];
  eligibility: JobseekerRegistrationData["eligibility"];
  work_experience: JobseekerRegistrationData["workExperience"];
  skills: JobseekerRegistrationData["skills"];
}

// Database representation where JSONB fields are generic Json
type Json = unknown;

interface JobseekerDBRecord {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: string;
  personal_info: Json;
  employment: Json;
  job_preference: Json;
  language: Json;
  education: Json;
  training: Json;
  eligibility: Json;
  work_experience: Json;
  skills: Json;
  // Extra columns from select("*") that we don't include in JobseekerFullRecord
  surname?: string;
  first_name?: string;
  sex?: string;
  employment_status?: string;
  city?: string;
  province?: string;
  is_ofw?: boolean;
  is_4ps_beneficiary?: boolean;
}

export async function getJobseekerById(
  id: number
): Promise<{ data?: JobseekerFullRecord; error?: string }> {
  try {
    const auth = await requireActiveUser();
    if (auth.error) {
      return { error: auth.error };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobseekers")
      .select("*")
      .eq("id", id)
      .single<JobseekerDBRecord>();

    if (error) {
      if (error.code === "PGRST116") {
        return { error: "Not found" };
      }
      console.error("getJobseekerById error:", error);
      return { error: error.message };
    }

    if (!data) {
      return { error: "Not found" };
    }

    // Explicitly map DB record to full record with type assertions for JSON fields
    const record: JobseekerFullRecord = {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      status: data.status,
      personal_info: data.personal_info as JobseekerRegistrationData["personalInfo"],
      employment: data.employment as JobseekerRegistrationData["employment"],
      job_preference: data.job_preference as JobseekerRegistrationData["jobPreference"],
      language: data.language as JobseekerRegistrationData["language"],
      education: data.education as JobseekerRegistrationData["education"],
      training: data.training as JobseekerRegistrationData["training"],
      eligibility: data.eligibility as JobseekerRegistrationData["eligibility"],
      work_experience: data.work_experience as JobseekerRegistrationData["workExperience"],
      skills: data.skills as JobseekerRegistrationData["skills"],
    };

    return { data: record };
  } catch (err) {
    console.error("getJobseekerById error:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Failed to fetch jobseeker" };
  }
}

export async function getJobseekers(
  filters: JobseekerFilters
): Promise<{ data?: GetJobseekersResult; error?: string }> {
  try {
    const auth = await requireActiveUser();
    if (auth.error) {
      return { error: auth.error };
    }

    const supabase = await createClient();
    // Build query with indexed columns for performance
    let query = supabase
      .from("jobseekers")
      .select(
        `
        id,
        surname,
        first_name,
        sex,
        employment_status,
        city,
        province,
        is_ofw,
        is_4ps_beneficiary,
        created_at,
        personal_info,
        employment,
        job_preference,
        skills
      `,
        { count: "exact" }
      );

    // Apply indexed filters (fast)
    if (filters.search) {
      const sanitizedSearch = sanitizeSearchQuery(filters.search);
      if (sanitizedSearch) {
        query = query.or(
          `surname.ilike.%${sanitizedSearch}%,first_name.ilike.%${sanitizedSearch}%`
        );
      }
    }
    if (filters.sex) query = query.eq("sex", filters.sex);
    if (filters.employmentStatus)
      query = query.eq("employment_status", filters.employmentStatus);
    if (filters.city) query = query.ilike("city", `%${filters.city}%`);
    if (filters.province) query = query.ilike("province", `%${filters.province}%`);
    if (filters.isOfw !== undefined && filters.isOfw !== "")
      query = query.eq("is_ofw", filters.isOfw === "true");
    if (filters.is4PsBeneficiary !== undefined && filters.is4PsBeneficiary !== "")
      query = query.eq("is_4ps_beneficiary", filters.is4PsBeneficiary === "true");

    // Apply JSONB filters for advanced fields
    if (filters.civilStatus) {
      query = query.eq("personal_info->>civilStatus", filters.civilStatus);
    }
    if (filters.barangay) {
      query = query.ilike("personal_info->address->>barangay", `%${filters.barangay}%`);
    }
    if (filters.employedType) {
      query = query.eq("employment->>employedType", filters.employedType);
    }
    if (filters.unemployedReason) {
      query = query.eq("employment->>unemployedReason", filters.unemployedReason);
    }
    if (filters.employmentType) {
      query = query.eq("job_preference->>employmentType", filters.employmentType);
    }
    if (filters.occupation1) {
      query = query.ilike("job_preference->>occupation1", `%${filters.occupation1}%`);
    }
    if (filters.tertiaryCourse) {
      query = query.ilike("education->tertiary->>course", `%${filters.tertiaryCourse}%`);
    }

    // Sorting
    const sortBy = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Pagination
    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return { error: error.message };
    }

    return {
      data: {
        jobseekers: data as JobseekerRecord[],
        total: count || 0,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil((count || 0) / filters.pageSize),
      },
    };
  } catch (error) {
    console.error("getJobseekers error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch jobseekers" };
  }
}

export async function exportJobseekersCSV(
  filters: Omit<JobseekerFilters, "page" | "pageSize">
): Promise<{ csv?: string; filename?: string; error?: string }> {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return { error: auth.error };
    }

    const supabase = await createClient();

    // We pass 'any' to cast the client because generateJobseekersCSV expects SupabaseClient
    // and the server client type might be slightly different or generic.
    return await generateJobseekersCSV(supabase as any, filters);
  } catch (error) {
    console.error("exportJobseekersCSV error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to export data" };
  }
}

export async function deleteJobseeker(
  id: number
): Promise<{ success?: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return { error: auth.error };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("jobseekers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("deleteJobseeker error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete jobseeker" };
  }
}

export async function bulkDeleteJobseekers(
  ids: number[]
): Promise<{ success?: boolean; error?: string }> {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return { error: auth.error };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("jobseekers")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Bulk delete error:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("bulkDeleteJobseekers error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete jobseekers" };
  }
}

export async function bulkArchiveJobseekers(
  ids: number[]
): Promise<{ success?: boolean; error?: string }> {
  try {
    const auth = await requireActiveUser();
    if (auth.error) {
      return { error: auth.error };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("jobseekers")
      .update({ status: "archived" })
      .in("id", ids);

    if (error) {
      console.error("Bulk archive error:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("bulkArchiveJobseekers error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to archive jobseekers" };
  }
}

// ============================================================================
// Dashboard Statistics
// ============================================================================

export interface DashboardStats {
  totalJobseekers: number;
  newThisMonth: number;
  newLastMonth: number;
  employed: number;
  unemployed: number;
  ofwCount: number;
  fourPsCount: number;
}

export async function getDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> {
  try {
    const auth = await requireActiveUser();
    if (auth.error) {
      return { data: null, error: auth.error };
    }

    const supabase = await createClient();

    // Call database function for efficient stats computation
    const { data, error } = await supabase.rpc("get_dashboard_stats");

    if (error) {
      console.error("Dashboard stats error:", error);
      return { data: null, error: error.message };
    }

    const row = Array.isArray(data) ? data[0] : data;

    return {
      data: {
        totalJobseekers: Number(row?.total ?? 0),
        newThisMonth: Number(row?.new_this_month ?? 0),
        newLastMonth: Number(row?.new_last_month ?? 0),
        employed: Number(row?.employed ?? 0),
        unemployed: Number(row?.unemployed ?? 0),
        ofwCount: Number(row?.ofw ?? 0),
        fourPsCount: Number(row?.four_ps ?? 0),
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}

export interface RecentJobseeker {
  id: number;
  name: string;
  initials: string;
  sex: string;
  age: number | null;
  barangay: string;
  employmentStatus: string;
  dateRegistered: string;
}

export async function getRecentJobseekers(
  limit = 10
): Promise<{ data: RecentJobseeker[] | null; error: string | null }> {
  try {
    const auth = await requireActiveUser();
    if (auth.error) {
      return { data: null, error: auth.error };
    }

    const supabase = await createClient();

    const { data: jobseekers, error } = await supabase
      .from("jobseekers")
      .select("id, personal_info, employment, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    const recent: RecentJobseeker[] =
      jobseekers?.map((j) => {
        const personalInfo = j.personal_info as Record<string, unknown> | null;
        const employment = j.employment as Record<string, unknown> | null;
        const address = personalInfo?.address as Record<string, unknown> | undefined;

        const surname = (personalInfo?.surname as string) || "";
        const firstName = (personalInfo?.firstName as string) || "";
        const name = [surname, firstName].filter(Boolean).join(", ") || "—";
        const initials = ((surname[0] || "") + (firstName[0] || "")).toUpperCase() || "—";

        const dateOfBirth = personalInfo?.dateOfBirth as string | undefined;
        let age: number | null = null;
        if (dateOfBirth) {
          const dob = new Date(dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
        }

        const sex = (personalInfo?.sex as string) || "—";
        const barangay = (address?.barangay as string) || "—";
        const employmentStatus =
          (employment?.status as string) === "EMPLOYED"
            ? "Employed"
            : (employment?.status as string) === "UNEMPLOYED"
              ? "Unemployed"
              : "—";

        const dateRegistered = new Date(j.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return {
          id: j.id,
          name,
          initials,
          sex,
          age,
          barangay,
          employmentStatus,
          dateRegistered,
        };
      }) || [];

    return { data: recent, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch recent jobseekers",
    };
  }
}
