// app/(app)/jobseekers/csv-config.ts

export interface DBJobseekerRecord {
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

export interface CsvColumn {
  header: string;
  accessor: (record: DBJobseekerRecord) => unknown;
}

export const escapeCSV = (val: unknown): string => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getTrainingColumns = (index: number): CsvColumn[] => [
  { header: `Training ${index + 1} - Course`, accessor: (r) => (r.training?.entries as any[])?.[index]?.course },
  { header: `Training ${index + 1} - Hours`, accessor: (r) => (r.training?.entries as any[])?.[index]?.hours },
  { header: `Training ${index + 1} - Institution`, accessor: (r) => (r.training?.entries as any[])?.[index]?.institution },
  { header: `Training ${index + 1} - Skills Acquired`, accessor: (r) => (r.training?.entries as any[])?.[index]?.skillsAcquired },
  { header: `Training ${index + 1} - NC I`, accessor: (r) => (r.training?.entries as any[])?.[index]?.certificates?.NC_I ? "Yes" : "No" },
  { header: `Training ${index + 1} - NC II`, accessor: (r) => (r.training?.entries as any[])?.[index]?.certificates?.NC_II ? "Yes" : "No" },
  { header: `Training ${index + 1} - NC III`, accessor: (r) => (r.training?.entries as any[])?.[index]?.certificates?.NC_III ? "Yes" : "No" },
  { header: `Training ${index + 1} - NC IV`, accessor: (r) => (r.training?.entries as any[])?.[index]?.certificates?.NC_IV ? "Yes" : "No" },
  { header: `Training ${index + 1} - COC`, accessor: (r) => (r.training?.entries as any[])?.[index]?.certificates?.COC ? "Yes" : "No" },
];

const getCivilServiceColumns = (index: number): CsvColumn[] => [
  { header: `Civil Service ${index + 1} - Name`, accessor: (r) => (r.eligibility?.civilService as any[])?.[index]?.name },
  { header: `Civil Service ${index + 1} - Date Taken`, accessor: (r) => (r.eligibility?.civilService as any[])?.[index]?.dateTaken },
];

const getProfLicenseColumns = (index: number): CsvColumn[] => [
  { header: `Professional License ${index + 1} - Name`, accessor: (r) => (r.eligibility?.professionalLicense as any[])?.[index]?.name },
  { header: `Professional License ${index + 1} - Valid Until`, accessor: (r) => (r.eligibility?.professionalLicense as any[])?.[index]?.validUntil },
];

const getWorkExpColumns = (index: number): CsvColumn[] => [
  { header: `Work ${index + 1} - Company`, accessor: (r) => (r.work_experience?.entries as any[])?.[index]?.companyName },
  { header: `Work ${index + 1} - Address`, accessor: (r) => (r.work_experience?.entries as any[])?.[index]?.address },
  { header: `Work ${index + 1} - Position`, accessor: (r) => (r.work_experience?.entries as any[])?.[index]?.position },
  { header: `Work ${index + 1} - Months`, accessor: (r) => (r.work_experience?.entries as any[])?.[index]?.numberOfMonths },
  { header: `Work ${index + 1} - Employment Status`, accessor: (r) => (r.work_experience?.entries as any[])?.[index]?.employmentStatus },
];

export const csvColumns: CsvColumn[] = [
  // Basic Info
  { header: "ID", accessor: (r) => r.id },
  { header: "Surname", accessor: (r) => (r.personal_info as any).surname },
  { header: "First Name", accessor: (r) => (r.personal_info as any).firstName },
  { header: "Middle Name", accessor: (r) => (r.personal_info as any).middleName },
  { header: "Suffix", accessor: (r) => (r.personal_info as any).suffix },
  { header: "Date of Birth", accessor: (r) => (r.personal_info as any).dateOfBirth },
  { header: "Place of Birth", accessor: (r) => (r.personal_info as any).placeOfBirth },
  { header: "Sex", accessor: (r) => (r.personal_info as any).sex },
  { header: "Religion", accessor: (r) => (r.personal_info as any).religion },
  { header: "Civil Status", accessor: (r) => (r.personal_info as any).civilStatus },
  { header: "House/Street", accessor: (r) => (r.personal_info.address as any)?.houseStreet },
  { header: "Barangay", accessor: (r) => (r.personal_info.address as any)?.barangay },
  { header: "City", accessor: (r) => (r.personal_info.address as any)?.city },
  { header: "Province", accessor: (r) => (r.personal_info.address as any)?.province },
  { header: "TIN", accessor: (r) => (r.personal_info as any).tin },
  { header: "Disability - Visual", accessor: (r) => (r.personal_info.disability as any)?.visual ? "Yes" : "No" },
  { header: "Disability - Hearing", accessor: (r) => (r.personal_info.disability as any)?.hearing ? "Yes" : "No" },
  { header: "Disability - Speech", accessor: (r) => (r.personal_info.disability as any)?.speech ? "Yes" : "No" },
  { header: "Disability - Physical", accessor: (r) => (r.personal_info.disability as any)?.physical ? "Yes" : "No" },
  { header: "Disability - Mental", accessor: (r) => (r.personal_info.disability as any)?.mental ? "Yes" : "No" },
  { header: "Disability - Others", accessor: (r) => (r.personal_info.disability as any)?.others },
  { header: "Height", accessor: (r) => (r.personal_info as any).height },
  { header: "Contact Number", accessor: (r) => (r.personal_info as any).contactNumber },
  { header: "Email", accessor: (r) => (r.personal_info as any).email },

  // Employment Status
  { header: "Employment Status", accessor: (r) => (r.employment as any).status },
  { header: "Employed Type", accessor: (r) => (r.employment as any).employedType },
  { header: "Self-Employed - Fisherman", accessor: (r) => (r.employment.selfEmployedTypes as any)?.fisherman ? "Yes" : "No" },
  { header: "Self-Employed - Vendor", accessor: (r) => (r.employment.selfEmployedTypes as any)?.vendor ? "Yes" : "No" },
  { header: "Self-Employed - Home Based", accessor: (r) => (r.employment.selfEmployedTypes as any)?.homeBased ? "Yes" : "No" },
  { header: "Self-Employed - Transport", accessor: (r) => (r.employment.selfEmployedTypes as any)?.transport ? "Yes" : "No" },
  { header: "Self-Employed - Domestic", accessor: (r) => (r.employment.selfEmployedTypes as any)?.domestic ? "Yes" : "No" },
  { header: "Self-Employed - Freelancer", accessor: (r) => (r.employment.selfEmployedTypes as any)?.freelancer ? "Yes" : "No" },
  { header: "Self-Employed - Artisan", accessor: (r) => (r.employment.selfEmployedTypes as any)?.artisan ? "Yes" : "No" },
  { header: "Self-Employed - Others", accessor: (r) => (r.employment.selfEmployedTypes as any)?.others },
  { header: "Unemployed Reason", accessor: (r) => (r.employment as any).unemployedReason },
  { header: "Terminated Country", accessor: (r) => (r.employment as any).terminatedCountry },
  { header: "Unemployed Reason Others", accessor: (r) => (r.employment as any).unemployedReasonOthers },
  { header: "Job Search Duration", accessor: (r) => (r.employment as any).jobSearchDuration },
  { header: "Is OFW", accessor: (r) => (r.employment as any).isOfw ? "Yes" : "No" },
  { header: "OFW Country", accessor: (r) => (r.employment as any).ofwCountry },
  { header: "Is Former OFW", accessor: (r) => (r.employment as any).isFormerOfw ? "Yes" : "No" },
  { header: "Former OFW Country", accessor: (r) => (r.employment as any).formerOfwCountry },
  { header: "OFW Return Date", accessor: (r) => (r.employment as any).ofwReturnDate },
  { header: "4Ps Beneficiary", accessor: (r) => (r.employment as any).is4PsBeneficiary ? "Yes" : "No" },
  { header: "Household ID Number", accessor: (r) => (r.employment as any).householdIdNumber },

  // Job Preference
  { header: "Preferred Employment Type", accessor: (r) => (r.job_preference as any).employmentType },
  { header: "Preferred Occupation 1", accessor: (r) => (r.job_preference as any).occupation1 },
  { header: "Preferred Occupation 2", accessor: (r) => (r.job_preference as any).occupation2 },
  { header: "Preferred Occupation 3", accessor: (r) => (r.job_preference as any).occupation3 },
  { header: "Local Location 1", accessor: (r) => (r.job_preference as any).localLocation1 },
  { header: "Local Location 2", accessor: (r) => (r.job_preference as any).localLocation2 },
  { header: "Local Location 3", accessor: (r) => (r.job_preference as any).localLocation3 },
  { header: "Overseas Location 1", accessor: (r) => (r.job_preference as any).overseasLocation1 },
  { header: "Overseas Location 2", accessor: (r) => (r.job_preference as any).overseasLocation2 },
  { header: "Overseas Location 3", accessor: (r) => (r.job_preference as any).overseasLocation3 },

  // Language
  { header: "English - Read", accessor: (r) => (r.language.english as any)?.read ? "Yes" : "No" },
  { header: "English - Write", accessor: (r) => (r.language.english as any)?.write ? "Yes" : "No" },
  { header: "English - Speak", accessor: (r) => (r.language.english as any)?.speak ? "Yes" : "No" },
  { header: "English - Understand", accessor: (r) => (r.language.english as any)?.understand ? "Yes" : "No" },
  { header: "Filipino - Read", accessor: (r) => (r.language.filipino as any)?.read ? "Yes" : "No" },
  { header: "Filipino - Write", accessor: (r) => (r.language.filipino as any)?.write ? "Yes" : "No" },
  { header: "Filipino - Speak", accessor: (r) => (r.language.filipino as any)?.speak ? "Yes" : "No" },
  { header: "Filipino - Understand", accessor: (r) => (r.language.filipino as any)?.understand ? "Yes" : "No" },
  { header: "Mandarin - Read", accessor: (r) => (r.language.mandarin as any)?.read ? "Yes" : "No" },
  { header: "Mandarin - Write", accessor: (r) => (r.language.mandarin as any)?.write ? "Yes" : "No" },
  { header: "Mandarin - Speak", accessor: (r) => (r.language.mandarin as any)?.speak ? "Yes" : "No" },
  { header: "Mandarin - Understand", accessor: (r) => (r.language.mandarin as any)?.understand ? "Yes" : "No" },
  { header: "Other Language Name", accessor: (r) => (r.language as any).othersName },
  { header: "Other Language - Read", accessor: (r) => (r.language.others as any)?.read ? "Yes" : "No" },
  { header: "Other Language - Write", accessor: (r) => (r.language.others as any)?.write ? "Yes" : "No" },
  { header: "Other Language - Speak", accessor: (r) => (r.language.others as any)?.speak ? "Yes" : "No" },
  { header: "Other Language - Understand", accessor: (r) => (r.language.others as any)?.understand ? "Yes" : "No" },

  // Education
  { header: "Currently in School", accessor: (r) => (r.education as any).currentlyInSchool ? "Yes" : "No" },
  { header: "Elementary - Year Graduated", accessor: (r) => (r.education.elementary as any)?.yearGraduated },
  { header: "Elementary - Level Reached", accessor: (r) => (r.education.elementary as any)?.levelReached },
  { header: "Elementary - Year Last Attended", accessor: (r) => (r.education.elementary as any)?.yearLastAttended },
  { header: "Secondary - Curriculum Type", accessor: (r) => (r.education.secondary as any)?.curriculumType },
  { header: "Secondary - Year Graduated", accessor: (r) => (r.education.secondary as any)?.yearGraduated },
  { header: "Secondary - Level Reached", accessor: (r) => (r.education.secondary as any)?.levelReached },
  { header: "Secondary - Year Last Attended", accessor: (r) => (r.education.secondary as any)?.yearLastAttended },
  { header: "Senior High - Strand", accessor: (r) => (r.education.seniorHigh as any)?.strand },
  { header: "Senior High - Year Graduated", accessor: (r) => (r.education.seniorHigh as any)?.yearGraduated },
  { header: "Senior High - Level Reached", accessor: (r) => (r.education.seniorHigh as any)?.levelReached },
  { header: "Senior High - Year Last Attended", accessor: (r) => (r.education.seniorHigh as any)?.yearLastAttended },
  { header: "Tertiary - Course", accessor: (r) => (r.education.tertiary as any)?.course },
  { header: "Tertiary - Year Graduated", accessor: (r) => (r.education.tertiary as any)?.yearGraduated },
  { header: "Tertiary - Level Reached", accessor: (r) => (r.education.tertiary as any)?.levelReached },
  { header: "Tertiary - Year Last Attended", accessor: (r) => (r.education.tertiary as any)?.yearLastAttended },
  { header: "Graduate - Course", accessor: (r) => (r.education.graduate as any)?.course },
  { header: "Graduate - Year Graduated", accessor: (r) => (r.education.graduate as any)?.yearGraduated },
  { header: "Graduate - Year Last Attended", accessor: (r) => (r.education.graduate as any)?.yearLastAttended },

  // Training
  ...getTrainingColumns(0),
  ...getTrainingColumns(1),
  ...getTrainingColumns(2),

  // Eligibility
  ...getCivilServiceColumns(0),
  ...getCivilServiceColumns(1),
  ...getCivilServiceColumns(2),
  ...getProfLicenseColumns(0),
  ...getProfLicenseColumns(1),
  ...getProfLicenseColumns(2),

  // Work Experience
  ...getWorkExpColumns(0),
  ...getWorkExpColumns(1),
  ...getWorkExpColumns(2),
  ...getWorkExpColumns(3),
  ...getWorkExpColumns(4),

  // Skills
  { header: "Skill - Auto Mechanic", accessor: (r) => (r.skills.otherSkills as any)?.auto_mechanic ? "Yes" : "No" },
  { header: "Skill - Beautician", accessor: (r) => (r.skills.otherSkills as any)?.beautician ? "Yes" : "No" },
  { header: "Skill - Carpentry Work", accessor: (r) => (r.skills.otherSkills as any)?.carpentry_work ? "Yes" : "No" },
  { header: "Skill - Computer Literate", accessor: (r) => (r.skills.otherSkills as any)?.computer_literate ? "Yes" : "No" },
  { header: "Skill - Domestic Chores", accessor: (r) => (r.skills.otherSkills as any)?.domestic_chores ? "Yes" : "No" },
  { header: "Skill - Driver", accessor: (r) => (r.skills.otherSkills as any)?.driver ? "Yes" : "No" },
  { header: "Skill - Electrician", accessor: (r) => (r.skills.otherSkills as any)?.electrician ? "Yes" : "No" },
  { header: "Skill - Embroidery", accessor: (r) => (r.skills.otherSkills as any)?.embroidery ? "Yes" : "No" },
  { header: "Skill - Gardening", accessor: (r) => (r.skills.otherSkills as any)?.gardening ? "Yes" : "No" },
  { header: "Skill - Masonry", accessor: (r) => (r.skills.otherSkills as any)?.masonry ? "Yes" : "No" },
  { header: "Skill - Painter Artist", accessor: (r) => (r.skills.otherSkills as any)?.painter_artist ? "Yes" : "No" },
  { header: "Skill - Painting Jobs", accessor: (r) => (r.skills.otherSkills as any)?.painting_jobs ? "Yes" : "No" },
  { header: "Skill - Photography", accessor: (r) => (r.skills.otherSkills as any)?.photography ? "Yes" : "No" },
  { header: "Skill - Plumbing", accessor: (r) => (r.skills.otherSkills as any)?.plumbing ? "Yes" : "No" },
  { header: "Skill - Sewing Dresses", accessor: (r) => (r.skills.otherSkills as any)?.sewing_dresses ? "Yes" : "No" },
  { header: "Skill - Stenography", accessor: (r) => (r.skills.otherSkills as any)?.stenography ? "Yes" : "No" },
  { header: "Skill - Tailoring", accessor: (r) => (r.skills.otherSkills as any)?.tailoring ? "Yes" : "No" },
  { header: "Skill - Others", accessor: (r) => (r.skills.otherSkills as any)?.others },

  // Certification
  { header: "Certification - Acknowledged", accessor: (r) => (r.skills.certification as any)?.acknowledged ? "Yes" : "No" },
  { header: "Certification - Signature", accessor: (r) => (r.skills.certification as any)?.signature },
  { header: "Certification - Date Signed", accessor: (r) => (r.skills.certification as any)?.dateSigned },

  // PESO Use Only
  { header: "Referral - SPES", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.spes ? "Yes" : "No" },
  { header: "Referral - GIP", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.gip ? "Yes" : "No" },
  { header: "Referral - TUPAD", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.tupad ? "Yes" : "No" },
  { header: "Referral - JobStart", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.jobstart ? "Yes" : "No" },
  { header: "Referral - DILEEP", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.dileep ? "Yes" : "No" },
  { header: "Referral - TESDA Training", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.tesda_training ? "Yes" : "No" },
  { header: "Referral - Others", accessor: (r) => (r.skills.pesoUseOnly?.referralPrograms as any)?.others },
  { header: "Assessed By", accessor: (r) => (r.skills.pesoUseOnly as any)?.assessedBy },
  { header: "Assessor Signature", accessor: (r) => (r.skills.pesoUseOnly as any)?.assessorSignature },
  { header: "Assessment Date", accessor: (r) => (r.skills.pesoUseOnly as any)?.assessmentDate },

  // System Fields
  { header: "Date Registered", accessor: (r) => new Date(r.created_at).toLocaleDateString() },
  { header: "Encoded By", accessor: (r) => r.created_by },
  { header: "Record Status", accessor: (r) => r.status },
];
