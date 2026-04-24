import type { JobseekerFilters } from "./actions.ts";
import {
  sanitizeSearchQuery,
  escapeLikeWildcards,
} from "./search-utils.ts";

export type JobseekerFiltersInput = Omit<
  JobseekerFilters,
  "page" | "pageSize" | "sortBy" | "sortOrder"
>;

/**
 * Minimal structural type for the subset of the Supabase query builder we
 * call. Callers pass `supabase.from(…).select(…)` (which is assignable to
 * this interface — PostgREST's builder returns `this` on every method we
 * use here).
 */
export interface FilterableQuery {
  eq(column: string, value: unknown): this;
  ilike(column: string, pattern: string): this;
  or(filters: string): this;
  lte(column: string, value: unknown): this;
  gte(column: string, value: unknown): this;
  not(column: string, operator: string, value: unknown): this;
  is(column: string, value: unknown): this;
}

const LANGUAGE_PROFICIENCY_KEYS = ["read", "write", "speak", "understand"] as const;

const SKILL_OTHER_KEYS = [
  "auto_mechanic", "beautician", "carpentry_work", "computer_literate", "domestic_chores",
  "driver", "electrician", "embroidery", "gardening", "masonry", "painter_artist",
  "painting_jobs", "photography", "plumbing", "sewing_dresses", "stenography", "tailoring", "others",
] as const;

const REFERRAL_PROGRAM_KEYS = [
  "spes", "gip", "tupad", "jobstart", "dileep", "tesda_training",
] as const;

function getDateYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

/**
 * Apply all user-supplied filters to a Supabase query builder. Used by both
 * the list (`getJobseekers`) and CSV export (`exportJobseekersCSV`) paths
 * so behavior stays in sync.
 */
export function applyJobseekerFilters<Q extends FilterableQuery>(
  query: Q,
  filters: JobseekerFiltersInput
): Q {
  if (filters.search) {
    const sanitizedSearch = sanitizeSearchQuery(filters.search);
    if (sanitizedSearch) {
      query = query.or(
        `surname.ilike.%${sanitizedSearch}%,first_name.ilike.%${sanitizedSearch}%`
      );
    }
  }
  if (filters.surname) {
    query = query.ilike(
      "surname",
      `%${escapeLikeWildcards(filters.surname)}%`
    );
  }
  if (filters.firstName) {
    query = query.ilike(
      "first_name",
      `%${escapeLikeWildcards(filters.firstName)}%`
    );
  }
  if (filters.sex) query = query.eq("sex", filters.sex);
  if (filters.employmentStatus)
    query = query.eq("employment_status", filters.employmentStatus);
  if (filters.city)
    query = query.ilike("city", `%${escapeLikeWildcards(filters.city)}%`);
  if (filters.province)
    query = query.ilike(
      "province",
      `%${escapeLikeWildcards(filters.province)}%`
    );
  if (filters.isOfw !== undefined && filters.isOfw !== "")
    query = query.eq("is_ofw", filters.isOfw === "true");
  if (filters.is4PsBeneficiary !== undefined && filters.is4PsBeneficiary !== "")
    query = query.eq("is_4ps_beneficiary", filters.is4PsBeneficiary === "true");

  if (filters.civilStatus) {
    query = query.eq("personal_info->>civilStatus", filters.civilStatus);
  }
  if (filters.barangay) {
    query = query.ilike(
      "personal_info->address->>barangay",
      `%${escapeLikeWildcards(filters.barangay)}%`
    );
  }
  if (filters.contactNumber) {
    query = query.ilike(
      "personal_info->>contactNumber",
      `%${escapeLikeWildcards(filters.contactNumber)}%`
    );
  }
  if (filters.email) {
    query = query.ilike(
      "personal_info->>email",
      `%${escapeLikeWildcards(filters.email)}%`
    );
  }
  if (filters.employedType) {
    query = query.eq("employment->>employedType", filters.employedType);
  }
  if (filters.unemployedReason) {
    query = query.eq("employment->>unemployedReason", filters.unemployedReason);
  }
  if (filters.ofwCountry) {
    query = query.ilike(
      "employment->>ofwCountry",
      `%${escapeLikeWildcards(filters.ofwCountry)}%`
    );
  }
  if (filters.employmentType) {
    query = query.eq("job_preference->>employmentType", filters.employmentType);
  }
  if (filters.localLocation) {
    const locVal = `%${escapeLikeWildcards(filters.localLocation)}%`;
    query = query.or(
      `job_preference->>localLocation1.ilike.${locVal},job_preference->>localLocation2.ilike.${locVal},job_preference->>localLocation3.ilike.${locVal}`
    );
  }
  if (filters.overseasLocation) {
    const locVal = `%${escapeLikeWildcards(filters.overseasLocation)}%`;
    query = query.or(
      `job_preference->>overseasLocation1.ilike.${locVal},job_preference->>overseasLocation2.ilike.${locVal},job_preference->>overseasLocation3.ilike.${locVal}`
    );
  }
  if (filters.occupation1) {
    query = query.ilike(
      "job_preference->>occupation1",
      `%${escapeLikeWildcards(filters.occupation1)}%`
    );
  }
  if (filters.tertiaryCourse) {
    query = query.ilike(
      "education->tertiary->>course",
      `%${escapeLikeWildcards(filters.tertiaryCourse)}%`
    );
  }
  if (
    filters.englishProficiency &&
    LANGUAGE_PROFICIENCY_KEYS.includes(
      filters.englishProficiency as (typeof LANGUAGE_PROFICIENCY_KEYS)[number]
    )
  ) {
    query = query.eq(
      `language->english->>${filters.englishProficiency}`,
      "true"
    );
  }
  if (
    filters.filipinoProficiency &&
    LANGUAGE_PROFICIENCY_KEYS.includes(
      filters.filipinoProficiency as (typeof LANGUAGE_PROFICIENCY_KEYS)[number]
    )
  ) {
    query = query.eq(
      `language->filipino->>${filters.filipinoProficiency}`,
      "true"
    );
  }
  if (
    filters.currentlyInSchool !== undefined &&
    filters.currentlyInSchool !== ""
  ) {
    query = query.eq(
      "education->>currentlyInSchool",
      filters.currentlyInSchool === "true" ? "true" : "false"
    );
  }
  if (filters.educationLevel) {
    query = query.ilike(
      "education->tertiary->>levelReached",
      `%${escapeLikeWildcards(filters.educationLevel)}%`
    );
  }
  if (filters.seniorHighStrand) {
    query = query.ilike(
      "education->seniorHigh->>strand",
      `%${escapeLikeWildcards(filters.seniorHighStrand)}%`
    );
  }
  if (filters.graduateCourse) {
    query = query.ilike(
      "education->graduate->>course",
      `%${escapeLikeWildcards(filters.graduateCourse)}%`
    );
  }
  if (filters.trainingCourse) {
    query = query.ilike(
      "training->entries->0->>course",
      `%${escapeLikeWildcards(filters.trainingCourse)}%`
    );
  }
  if (filters.trainingInstitution) {
    query = query.ilike(
      "training->entries->0->>institution",
      `%${escapeLikeWildcards(filters.trainingInstitution)}%`
    );
  }
  if (
    filters.hasCertificates !== undefined &&
    filters.hasCertificates !== ""
  ) {
    if (filters.hasCertificates === "true") {
      query = query.not("training->entries->0", "is", null);
    } else {
      query = query.is("training->entries->0", null);
    }
  }
  if (filters.civilServiceExam) {
    query = query.ilike(
      "eligibility->civilService->0->>name",
      `%${escapeLikeWildcards(filters.civilServiceExam)}%`
    );
  }
  if (filters.professionalLicense) {
    query = query.ilike(
      "eligibility->professionalLicense->0->>name",
      `%${escapeLikeWildcards(filters.professionalLicense)}%`
    );
  }
  if (filters.companyName) {
    query = query.ilike(
      "work_experience->entries->0->>companyName",
      `%${escapeLikeWildcards(filters.companyName)}%`
    );
  }
  if (filters.position) {
    query = query.ilike(
      "work_experience->entries->0->>position",
      `%${escapeLikeWildcards(filters.position)}%`
    );
  }
  if (filters.workEmploymentStatus) {
    query = query.eq(
      "work_experience->entries->0->>employmentStatus",
      filters.workEmploymentStatus
    );
  }
  if (
    filters.skillType &&
    SKILL_OTHER_KEYS.includes(
      filters.skillType as (typeof SKILL_OTHER_KEYS)[number]
    )
  ) {
    query = query.eq(`skills->otherSkills->>${filters.skillType}`, "true");
  }
  if (filters.referralProgram) {
    const key = filters.referralProgram.toLowerCase();
    if (
      REFERRAL_PROGRAM_KEYS.includes(
        key as (typeof REFERRAL_PROGRAM_KEYS)[number]
      )
    ) {
      query = query.eq(
        `skills->pesoUseOnly->referralPrograms->>${key}`,
        "true"
      );
    }
  }

  const ageMin = parseInt(String(filters.ageMin ?? ""), 10);
  const ageMax = parseInt(String(filters.ageMax ?? ""), 10);
  if (!Number.isNaN(ageMin) && ageMin >= 0) {
    query = query.lte("personal_info->>dateOfBirth", getDateYearsAgo(ageMin));
  }
  if (!Number.isNaN(ageMax) && ageMax >= 0) {
    query = query.gte("personal_info->>dateOfBirth", getDateYearsAgo(ageMax));
  }

  return query;
}
