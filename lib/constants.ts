export const CIVIL_STATUS_OPTIONS = [
  { label: "Single", value: "SINGLE" },
  { label: "Married", value: "MARRIED" },
  { label: "Widowed", value: "WIDOWED" },
  { label: "Separated", value: "SEPARATED" },
] as const;

export const SEX_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
] as const;

export const SUFFIX_OPTIONS = [
  { label: "Jr.", value: "JR" },
  { label: "Sr.", value: "SR" },
  { label: "III", value: "III" },
  { label: "IV", value: "IV" },
  { label: "V", value: "V" },
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { label: "Employed", value: "EMPLOYED" },
  { label: "Unemployed", value: "UNEMPLOYED" },
] as const;

export const EMPLOYED_TYPE_OPTIONS = [
  { label: "Wage Employed", value: "WAGE" },
  { label: "Self-Employed", value: "SELF_EMPLOYED" },
] as const;

export const UNEMPLOYED_REASON_OPTIONS = [
  { label: "New Entrant", value: "NEW_ENTRANT" },
  { label: "Finished Contract", value: "FINISHED_CONTRACT" },
  { label: "Resigned", value: "RESIGNED" },
  { label: "Retired", value: "RETIRED" },
  { label: "Terminated (Local)", value: "TERMINATED_LOCAL" },
  { label: "Terminated (Abroad)", value: "TERMINATED_ABROAD" },
  { label: "Terminated (Calamity)", value: "TERMINATED_CALAMITY" },
  { label: "Others", value: "OTHERS" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Part Time", value: "PART_TIME" },
  { label: "Full Time", value: "FULL_TIME" },
] as const;

export const WORK_EMPLOYMENT_STATUS_OPTIONS = [
  { label: "Permanent", value: "PERMANENT" },
  { label: "Contractual", value: "CONTRACTUAL" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Probationary", value: "PROBATIONARY" },
] as const;

export const PROFICIENCY_OPTIONS = [
  { label: "Can Read", value: "read" },
  { label: "Can Write", value: "write" },
  { label: "Can Speak", value: "speak" },
  { label: "Can Understand", value: "understand" },
] as const;

export const CERTIFICATE_OPTIONS = [
  { label: "NC I", value: "NC_I" },
  { label: "NC II", value: "NC_II" },
  { label: "NC III", value: "NC_III" },
  { label: "NC IV", value: "NC_IV" },
  { label: "COC", value: "COC" },
] as const;

export const SKILL_TYPE_OPTIONS = [
  { label: "Auto Mechanic", value: "auto_mechanic" },
  { label: "Beautician", value: "beautician" },
  { label: "Carpentry Work", value: "carpentry_work" },
  { label: "Computer Literate", value: "computer_literate" },
  { label: "Domestic Chores", value: "domestic_chores" },
  { label: "Driver", value: "driver" },
  { label: "Electrician", value: "electrician" },
  { label: "Embroidery", value: "embroidery" },
  { label: "Gardening", value: "gardening" },
  { label: "Masonry", value: "masonry" },
  { label: "Painter/Artist", value: "painter_artist" },
  { label: "Painting Jobs", value: "painting_jobs" },
  { label: "Photography", value: "photography" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Sewing Dresses", value: "sewing_dresses" },
  { label: "Stenography", value: "stenography" },
  { label: "Tailoring", value: "tailoring" },
] as const;

export const REFERRAL_PROGRAM_OPTIONS = [
  { label: "SPES", value: "spes" },
  { label: "GIP", value: "gip" },
  { label: "TUPAD", value: "tupad" },
  { label: "JobStart", value: "jobstart" },
  { label: "DILEEP", value: "dileep" },
  { label: "TESDA Training", value: "tesda_training" },
] as const;

export const BOOLEAN_FILTER_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
] as const;
