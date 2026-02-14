"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import type { JobseekerRegistrationData } from "@/lib/validations/jobseeker-registration";
import { sanitizeSearchQuery, escapeLikeWildcards } from "./search-utils";
import {
  escapeCSV,
  getTraining,
  getCivilService,
  getProfLicense,
  getWorkExp,
} from "./csv-helpers";

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
    if (filters.city) query = query.ilike("city", `%${escapeLikeWildcards(filters.city)}%`);
    if (filters.province)
      query = query.ilike("province", `%${escapeLikeWildcards(filters.province)}%`);
    if (filters.isOfw !== undefined && filters.isOfw !== "")
      query = query.eq("is_ofw", filters.isOfw === "true");
    if (filters.is4PsBeneficiary !== undefined && filters.is4PsBeneficiary !== "")
      query = query.eq("is_4ps_beneficiary", filters.is4PsBeneficiary === "true");

    // Apply JSONB filters for advanced fields
    if (filters.civilStatus) {
      query = query.eq("personal_info->>civilStatus", filters.civilStatus);
    }
    if (filters.barangay) {
      query = query.ilike(
        "personal_info->address->>barangay",
        `%${escapeLikeWildcards(filters.barangay)}%`
      );
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

    // Type for database record structure
    interface DBJobseekerRecord {
      id: number;
      created_at: string;
      created_by: string;
      status: string;
      employment_status: string;
      is_ofw: boolean;
      is_4ps_beneficiary: boolean;
      personal_info: Record<string, unknown>;
      employment: Record<string, unknown>;
      job_preference: Record<string, unknown>;
      language: Record<string, unknown>;
      education: Record<string, unknown>;
      training: Record<string, unknown>;
      eligibility: Record<string, unknown>;
      work_experience: Record<string, unknown>;
      skills: Record<string, unknown>;
    }

    // Convert to CSV format with ALL 200+ fields matching DOLE NSRP form
    const headers = [
      // Basic Info
      "ID",
      "Surname",
      "First Name", 
      "Middle Name",
      "Suffix",
      "Date of Birth",
      "Place of Birth",
      "Sex",
      "Religion",
      "Civil Status",
      "House/Street",
      "Barangay",
      "City",
      "Province",
      "TIN",
      "Disability - Visual",
      "Disability - Hearing",
      "Disability - Speech",
      "Disability - Physical",
      "Disability - Mental",
      "Disability - Others",
      "Height",
      "Contact Number",
      "Email",
      
      // Employment Status
      "Employment Status",
      "Employed Type",
      "Self-Employed - Fisherman",
      "Self-Employed - Vendor",
      "Self-Employed - Home Based",
      "Self-Employed - Transport",
      "Self-Employed - Domestic",
      "Self-Employed - Freelancer",
      "Self-Employed - Artisan",
      "Self-Employed - Others",
      "Unemployed Reason",
      "Terminated Country",
      "Unemployed Reason Others",
      "Job Search Duration",
      "Is OFW",
      "OFW Country",
      "Is Former OFW",
      "Former OFW Country",
      "OFW Return Date",
      "4Ps Beneficiary",
      "Household ID Number",
      
      // Job Preference
      "Preferred Employment Type",
      "Preferred Occupation 1",
      "Preferred Occupation 2",
      "Preferred Occupation 3",
      "Local Location 1",
      "Local Location 2",
      "Local Location 3",
      "Overseas Location 1",
      "Overseas Location 2",
      "Overseas Location 3",
      
      // Language
      "English - Read",
      "English - Write",
      "English - Speak",
      "English - Understand",
      "Filipino - Read",
      "Filipino - Write",
      "Filipino - Speak",
      "Filipino - Understand",
      "Mandarin - Read",
      "Mandarin - Write",
      "Mandarin - Speak",
      "Mandarin - Understand",
      "Other Language Name",
      "Other Language - Read",
      "Other Language - Write",
      "Other Language - Speak",
      "Other Language - Understand",
      
      // Education
      "Currently in School",
      "Elementary - Year Graduated",
      "Elementary - Level Reached",
      "Elementary - Year Last Attended",
      "Secondary - Curriculum Type",
      "Secondary - Year Graduated",
      "Secondary - Level Reached",
      "Secondary - Year Last Attended",
      "Senior High - Strand",
      "Senior High - Year Graduated",
      "Senior High - Level Reached",
      "Senior High - Year Last Attended",
      "Tertiary - Course",
      "Tertiary - Year Graduated",
      "Tertiary - Level Reached",
      "Tertiary - Year Last Attended",
      "Graduate - Course",
      "Graduate - Year Graduated",
      "Graduate - Year Last Attended",
      
      // Training (multiple entries - showing first 3)
      "Training 1 - Course",
      "Training 1 - Hours",
      "Training 1 - Institution",
      "Training 1 - Skills Acquired",
      "Training 1 - NC I",
      "Training 1 - NC II",
      "Training 1 - NC III",
      "Training 1 - NC IV",
      "Training 1 - COC",
      "Training 2 - Course",
      "Training 2 - Hours",
      "Training 2 - Institution",
      "Training 2 - Skills Acquired",
      "Training 2 - NC I",
      "Training 2 - NC II",
      "Training 2 - NC III",
      "Training 2 - NC IV",
      "Training 2 - COC",
      "Training 3 - Course",
      "Training 3 - Hours",
      "Training 3 - Institution",
      "Training 3 - Skills Acquired",
      "Training 3 - NC I",
      "Training 3 - NC II",
      "Training 3 - NC III",
      "Training 3 - NC IV",
      "Training 3 - COC",
      
      // Eligibility (multiple entries - showing first 3 of each)
      "Civil Service 1 - Name",
      "Civil Service 1 - Date Taken",
      "Civil Service 2 - Name",
      "Civil Service 2 - Date Taken",
      "Civil Service 3 - Name",
      "Civil Service 3 - Date Taken",
      "Professional License 1 - Name",
      "Professional License 1 - Valid Until",
      "Professional License 2 - Name",
      "Professional License 2 - Valid Until",
      "Professional License 3 - Name",
      "Professional License 3 - Valid Until",
      
      // Work Experience (multiple entries - showing first 5)
      "Work 1 - Company",
      "Work 1 - Address",
      "Work 1 - Position",
      "Work 1 - Months",
      "Work 1 - Employment Status",
      "Work 2 - Company",
      "Work 2 - Address",
      "Work 2 - Position",
      "Work 2 - Months",
      "Work 2 - Employment Status",
      "Work 3 - Company",
      "Work 3 - Address",
      "Work 3 - Position",
      "Work 3 - Months",
      "Work 3 - Employment Status",
      "Work 4 - Company",
      "Work 4 - Address",
      "Work 4 - Position",
      "Work 4 - Months",
      "Work 4 - Employment Status",
      "Work 5 - Company",
      "Work 5 - Address",
      "Work 5 - Position",
      "Work 5 - Months",
      "Work 5 - Employment Status",
      
      // Skills
      "Skill - Auto Mechanic",
      "Skill - Beautician",
      "Skill - Carpentry Work",
      "Skill - Computer Literate",
      "Skill - Domestic Chores",
      "Skill - Driver",
      "Skill - Electrician",
      "Skill - Embroidery",
      "Skill - Gardening",
      "Skill - Masonry",
      "Skill - Painter/Artist",
      "Skill - Painting Jobs",
      "Skill - Photography",
      "Skill - Plumbing",
      "Skill - Sewing Dresses",
      "Skill - Stenography",
      "Skill - Tailoring",
      "Skill - Others",
      
      // Certification
      "Certification Acknowledged",
      "Signature",
      "Date Signed",
      
      // PESO Use Only
      "Referral - SPES",
      "Referral - GIP",
      "Referral - TUPAD",
      "Referral - JobStart",
      "Referral - DILEEP",
      "Referral - TESDA Training",
      "Referral - Others",
      "Assessed By",
      "Assessor Signature",
      "Assessment Date",
      
      // System Fields
      "Date Registered",
      "Created By",
      "Status",
    ];

    const csvRows = [headers.join(",")];

    // Pagination config
    const PAGE_SIZE = 1000;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        // Build query fresh for each iteration
        let query = supabase.from("jobseekers").select("*");

        // Apply filters
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
        if (filters.city) query = query.ilike("city", `%${escapeLikeWildcards(filters.city)}%`);
        if (filters.province)
          query = query.ilike("province", `%${escapeLikeWildcards(filters.province)}%`);
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
        if (filters.employedType) {
          query = query.eq("employment->>employedType", filters.employedType);
        }
        if (filters.unemployedReason) {
          query = query.eq("employment->>unemployedReason", filters.unemployedReason);
        }
        if (filters.employmentType) {
          query = query.eq("job_preference->>employmentType", filters.employmentType);
        }

        // Add deterministic sort and pagination
        query = query.order("id", { ascending: true });
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;
        query = query.range(start, end);

        const { data, error } = await query;

        if (error) {
          console.error("Export query error:", error);
          return { error: error.message };
        }

        if (!data || data.length === 0) {
            hasMore = false;
            break;
        }

        // Process this chunk
        data.forEach((record: DBJobseekerRecord) => {
          const personalInfo = (record.personal_info || {}) as Record<string, unknown>;
          const address = (personalInfo.address || {}) as Record<string, unknown>;
          const disability = (personalInfo.disability || {}) as Record<string, unknown>;
          const employment = (record.employment || {}) as Record<string, unknown>;
          const selfEmployed = (employment.selfEmployedTypes || {}) as Record<string, unknown>;
          const jobPref = (record.job_preference || {}) as Record<string, unknown>;
          const lang = (record.language || {}) as Record<string, unknown>;
          const edu = (record.education || {}) as Record<string, unknown>;
          const training = (record.training || {}) as Record<string, unknown>;
          const trainingEntries = (training.entries || []) as Array<Record<string, unknown>>;
          const eligibility = (record.eligibility || {}) as Record<string, unknown>;
          const civilService = (eligibility.civilService || []) as Array<Record<string, unknown>>;
          const profLicense = (eligibility.professionalLicense || []) as Array<Record<string, unknown>>;
          const workExp = (record.work_experience || {}) as Record<string, unknown>;
          const workEntries = (workExp.entries || []) as Array<Record<string, unknown>>;
          const skills = (record.skills || {}) as Record<string, unknown>;
          const otherSkills = (skills.otherSkills || {}) as Record<string, unknown>;
          const cert = (skills.certification || {}) as Record<string, unknown>;
          const pesoUse = (skills.pesoUseOnly || {}) as Record<string, unknown>;
          const referralPrograms = (pesoUse.referralPrograms || {}) as Record<string, unknown>;

          const row = [
            // Basic Info
            record.id,
            escapeCSV(personalInfo.surname),
            escapeCSV(personalInfo.firstName),
            escapeCSV(personalInfo.middleName),
            escapeCSV(personalInfo.suffix),
            escapeCSV(personalInfo.dateOfBirth),
            escapeCSV(personalInfo.placeOfBirth),
            escapeCSV(personalInfo.sex),
            escapeCSV(personalInfo.religion),
            escapeCSV(personalInfo.civilStatus),
            escapeCSV(address.houseStreet),
            escapeCSV(address.barangay),
            escapeCSV(address.city),
            escapeCSV(address.province),
            escapeCSV(personalInfo.tin),
            disability.visual ? "Yes" : "No",
            disability.hearing ? "Yes" : "No",
            disability.speech ? "Yes" : "No",
            disability.physical ? "Yes" : "No",
            disability.mental ? "Yes" : "No",
            escapeCSV(disability.others),
            escapeCSV(personalInfo.height),
            escapeCSV(personalInfo.contactNumber),
            escapeCSV(personalInfo.email),

            // Employment
            escapeCSV(employment.status),
            escapeCSV(employment.employedType),
            selfEmployed.fisherman ? "Yes" : "No",
            selfEmployed.vendor ? "Yes" : "No",
            selfEmployed.homeBased ? "Yes" : "No",
            selfEmployed.transport ? "Yes" : "No",
            selfEmployed.domestic ? "Yes" : "No",
            selfEmployed.freelancer ? "Yes" : "No",
            selfEmployed.artisan ? "Yes" : "No",
            escapeCSV(selfEmployed.others),
            escapeCSV(employment.unemployedReason),
            escapeCSV(employment.terminatedCountry),
            escapeCSV(employment.unemployedReasonOthers),
            escapeCSV(employment.jobSearchDuration),
            employment.isOfw ? "Yes" : "No",
            escapeCSV(employment.ofwCountry),
            employment.isFormerOfw ? "Yes" : "No",
            escapeCSV(employment.formerOfwCountry),
            escapeCSV(employment.ofwReturnDate),
            employment.is4PsBeneficiary ? "Yes" : "No",
            escapeCSV(employment.householdIdNumber),

            // Job Preference
            escapeCSV(jobPref.employmentType),
            escapeCSV(jobPref.occupation1),
            escapeCSV(jobPref.occupation2),
            escapeCSV(jobPref.occupation3),
            escapeCSV(jobPref.localLocation1),
            escapeCSV(jobPref.localLocation2),
            escapeCSV(jobPref.localLocation3),
            escapeCSV(jobPref.overseasLocation1),
            escapeCSV(jobPref.overseasLocation2),
            escapeCSV(jobPref.overseasLocation3),

            // Language
            (lang.english as Record<string, unknown>)?.read ? "Yes" : "No",
            (lang.english as Record<string, unknown>)?.write ? "Yes" : "No",
            (lang.english as Record<string, unknown>)?.speak ? "Yes" : "No",
            (lang.english as Record<string, unknown>)?.understand ? "Yes" : "No",
            (lang.filipino as Record<string, unknown>)?.read ? "Yes" : "No",
            (lang.filipino as Record<string, unknown>)?.write ? "Yes" : "No",
            (lang.filipino as Record<string, unknown>)?.speak ? "Yes" : "No",
            (lang.filipino as Record<string, unknown>)?.understand ? "Yes" : "No",
            (lang.mandarin as Record<string, unknown>)?.read ? "Yes" : "No",
            (lang.mandarin as Record<string, unknown>)?.write ? "Yes" : "No",
            (lang.mandarin as Record<string, unknown>)?.speak ? "Yes" : "No",
            (lang.mandarin as Record<string, unknown>)?.understand ? "Yes" : "No",
            escapeCSV(lang.othersName),
            (lang.others as Record<string, unknown>)?.read ? "Yes" : "No",
            (lang.others as Record<string, unknown>)?.write ? "Yes" : "No",
            (lang.others as Record<string, unknown>)?.speak ? "Yes" : "No",
            (lang.others as Record<string, unknown>)?.understand ? "Yes" : "No",

            // Education
            edu.currentlyInSchool ? "Yes" : "No",
            escapeCSV((edu.elementary as Record<string, unknown>)?.yearGraduated),
            escapeCSV((edu.elementary as Record<string, unknown>)?.levelReached),
            escapeCSV((edu.elementary as Record<string, unknown>)?.yearLastAttended),
            escapeCSV((edu.secondary as Record<string, unknown>)?.curriculumType),
            escapeCSV((edu.secondary as Record<string, unknown>)?.yearGraduated),
            escapeCSV((edu.secondary as Record<string, unknown>)?.levelReached),
            escapeCSV((edu.secondary as Record<string, unknown>)?.yearLastAttended),
            escapeCSV((edu.seniorHigh as Record<string, unknown>)?.strand),
            escapeCSV((edu.seniorHigh as Record<string, unknown>)?.yearGraduated),
            escapeCSV((edu.seniorHigh as Record<string, unknown>)?.levelReached),
            escapeCSV((edu.seniorHigh as Record<string, unknown>)?.yearLastAttended),
            escapeCSV((edu.tertiary as Record<string, unknown>)?.course),
            escapeCSV((edu.tertiary as Record<string, unknown>)?.yearGraduated),
            escapeCSV((edu.tertiary as Record<string, unknown>)?.levelReached),
            escapeCSV((edu.tertiary as Record<string, unknown>)?.yearLastAttended),
            escapeCSV((edu.graduate as Record<string, unknown>)?.course),
            escapeCSV((edu.graduate as Record<string, unknown>)?.yearGraduated),
            escapeCSV((edu.graduate as Record<string, unknown>)?.yearLastAttended),

            // Training (first 3 entries)
            ...getTraining(trainingEntries, 0),
            ...getTraining(trainingEntries, 1),
            ...getTraining(trainingEntries, 2),

            // Eligibility
            ...getCivilService(civilService, 0),
            ...getCivilService(civilService, 1),
            ...getCivilService(civilService, 2),
            ...getProfLicense(profLicense, 0),
            ...getProfLicense(profLicense, 1),
            ...getProfLicense(profLicense, 2),

            // Work Experience (first 5)
            ...getWorkExp(workEntries, 0),
            ...getWorkExp(workEntries, 1),
            ...getWorkExp(workEntries, 2),
            ...getWorkExp(workEntries, 3),
            ...getWorkExp(workEntries, 4),

            // Skills
            otherSkills.auto_mechanic ? "Yes" : "No",
            otherSkills.beautician ? "Yes" : "No",
            otherSkills.carpentry_work ? "Yes" : "No",
            otherSkills.computer_literate ? "Yes" : "No",
            otherSkills.domestic_chores ? "Yes" : "No",
            otherSkills.driver ? "Yes" : "No",
            otherSkills.electrician ? "Yes" : "No",
            otherSkills.embroidery ? "Yes" : "No",
            otherSkills.gardening ? "Yes" : "No",
            otherSkills.masonry ? "Yes" : "No",
            otherSkills.painter_artist ? "Yes" : "No",
            otherSkills.painting_jobs ? "Yes" : "No",
            otherSkills.photography ? "Yes" : "No",
            otherSkills.plumbing ? "Yes" : "No",
            otherSkills.sewing_dresses ? "Yes" : "No",
            otherSkills.stenography ? "Yes" : "No",
            otherSkills.tailoring ? "Yes" : "No",
            escapeCSV(otherSkills.others),

            // Certification
            cert.acknowledged ? "Yes" : "No",
            escapeCSV(cert.signature),
            escapeCSV(cert.dateSigned),

            // PESO Use Only
            referralPrograms.spes ? "Yes" : "No",
            referralPrograms.gip ? "Yes" : "No",
            referralPrograms.tupad ? "Yes" : "No",
            referralPrograms.jobstart ? "Yes" : "No",
            referralPrograms.dileep ? "Yes" : "No",
            referralPrograms.tesda_training ? "Yes" : "No",
            escapeCSV(referralPrograms.others),
            escapeCSV(pesoUse.assessedBy),
            escapeCSV(pesoUse.assessorSignature),
            escapeCSV(pesoUse.assessmentDate),

            // System Fields
            new Date(record.created_at).toLocaleDateString(),
            escapeCSV(record.created_by),
            escapeCSV(record.status),
          ];

          csvRows.push(row.join(","));
        });

        // Check for termination
        if (data.length < PAGE_SIZE) {
            hasMore = false;
        }
        page++;
    }

    if (csvRows.length === 1) { // Only headers
        return { error: "No data to export" };
    }

    const csv = csvRows.join("\n");
    const filename = `jobseekers_${new Date().toISOString().split("T")[0]}.csv`;

    return { csv, filename };
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
