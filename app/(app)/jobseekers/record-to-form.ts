import type { JobseekerRegistrationData } from "@/lib/validations/jobseeker-registration";
import { JOBSEEKER_REGISTRATION_DEFAULTS } from "@/lib/validations/jobseeker-registration-defaults";
import type { JobseekerFullRecord } from "./actions";

function deepMergeSection<T extends object>(
  defaultSection: T,
  fromRecord: unknown
): T {
  if (fromRecord == null || typeof fromRecord !== "object") {
    return defaultSection;
  }
  const recordObj = fromRecord as Record<string, unknown>;
  const result = { ...defaultSection } as Record<string, unknown>;
  for (const key of Object.keys(defaultSection)) {
    const defaultVal = (defaultSection as Record<string, unknown>)[key];
    const recordVal = recordObj[key];
    if (recordVal === undefined) continue;
    if (
      defaultVal !== null &&
      typeof defaultVal === "object" &&
      !Array.isArray(defaultVal) &&
      recordVal !== null &&
      typeof recordVal === "object" &&
      !Array.isArray(recordVal)
    ) {
      result[key] = deepMergeSection(
        defaultVal as Record<string, unknown>,
        recordVal
      ) as T[keyof T];
    } else if (Array.isArray(defaultVal) && Array.isArray(recordVal)) {
      result[key] = recordVal.length ? recordVal : defaultVal;
    } else {
      result[key] = recordVal;
    }
  }
  return result as T;
}

function fixTrainingEntries(
  entries: unknown[]
): JobseekerRegistrationData["training"]["entries"] {
  return entries.map((entry: unknown) => {
    if (entry === null || typeof entry !== "object") {
      return {
        course: "",
        hours: "",
        institution: "",
        skillsAcquired: "",
        certificates: {
          NC_I: false,
          NC_II: false,
          NC_III: false,
          NC_IV: false,
          COC: false,
        },
      };
    }
    const obj = entry as Record<string, unknown>;
    let certificates = obj.certificates;
    if (Array.isArray(certificates)) {
      certificates = {
        NC_I: false,
        NC_II: false,
        NC_III: false,
        NC_IV: false,
        COC: false,
      };
    }
    return {
      course: typeof obj.course === "string" ? obj.course : "",
      hours: typeof obj.hours === "string" ? obj.hours : "",
      institution: typeof obj.institution === "string" ? obj.institution : "",
      skillsAcquired:
        typeof obj.skillsAcquired === "string" ? obj.skillsAcquired : "",
      certificates:
        certificates && typeof certificates === "object"
          ? {
              NC_I: Boolean((certificates as Record<string, unknown>).NC_I),
              NC_II: Boolean((certificates as Record<string, unknown>).NC_II),
              NC_III: Boolean((certificates as Record<string, unknown>).NC_III),
              NC_IV: Boolean((certificates as Record<string, unknown>).NC_IV),
              COC: Boolean((certificates as Record<string, unknown>).COC),
            }
          : {
              NC_I: false,
              NC_II: false,
              NC_III: false,
              NC_IV: false,
              COC: false,
            },
    };
  });
}

/**
 * Converts a jobseeker DB record (snake_case keys) to form data (camelCase) with defaults merged in.
 * Use when prefilling the registration form for edit.
 */
export function jobseekerRecordToFormData(
  record: JobseekerFullRecord
): JobseekerRegistrationData {
  const D = JOBSEEKER_REGISTRATION_DEFAULTS;

  const trainingEntries = Array.isArray(record.training?.entries)
    ? fixTrainingEntries(record.training.entries)
    : D.training.entries;

  const eligibilityCivilService = Array.isArray(record.eligibility?.civilService)
    ? record.eligibility.civilService
    : D.eligibility.civilService;
  const eligibilityProfLicense = Array.isArray(
    record.eligibility?.professionalLicense
  )
    ? record.eligibility.professionalLicense
    : D.eligibility.professionalLicense;
  const workEntries = Array.isArray(record.work_experience?.entries)
    ? record.work_experience.entries
    : D.workExperience.entries;

  return {
    personalInfo: deepMergeSection(D.personalInfo, record.personal_info),
    employment: deepMergeSection(D.employment, record.employment),
    jobPreference: deepMergeSection(D.jobPreference, record.job_preference),
    language: deepMergeSection(D.language, record.language),
    education: deepMergeSection(D.education, record.education),
    training: { entries: trainingEntries },
    eligibility: {
      civilService: eligibilityCivilService,
      professionalLicense: eligibilityProfLicense,
    },
    workExperience: { entries: workEntries },
    skills: deepMergeSection(D.skills, record.skills),
  };
}
