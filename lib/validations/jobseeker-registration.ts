import { z } from "zod";

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  suffix: z.enum(["JR", "SR", "III", "IV", "V"]).optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required" }),
  religion: z.string().optional(),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED"], {
    message: "Civil status is required",
  }),
  address: z.object({
    houseStreet: z.string().optional(),
    barangay: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
  }),
  tin: z.string().optional(),
  disability: z.object({
    visual: z.boolean().optional(),
    hearing: z.boolean().optional(),
    speech: z.boolean().optional(),
    physical: z.boolean().optional(),
    mental: z.boolean().optional(),
    others: z.string().optional(),
  }),
  height: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
});

// Step 2: Employment Status
export const employmentSchema = z.object({
  status: z.enum(["EMPLOYED", "UNEMPLOYED"], {
    message: "Employment status is required",
  }),
  employedType: z.enum(["WAGE", "SELF_EMPLOYED"]).optional(),
  selfEmployedTypes: z
    .object({
      fisherman: z.boolean().optional(),
      vendor: z.boolean().optional(),
      homeBased: z.boolean().optional(),
      transport: z.boolean().optional(),
      domestic: z.boolean().optional(),
      freelancer: z.boolean().optional(),
      artisan: z.boolean().optional(),
      others: z.string().optional(),
    })
    .optional(),
  unemployedReason: z
    .enum([
      "NEW_ENTRANT",
      "FINISHED_CONTRACT",
      "RESIGNED",
      "RETIRED",
      "TERMINATED_LOCAL",
      "TERMINATED_ABROAD",
      "TERMINATED_CALAMITY",
      "OTHERS",
    ])
    .optional(),
  terminatedCountry: z.string().optional(),
  unemployedReasonOthers: z.string().optional(),
  jobSearchDuration: z.string().optional(),
  isOfw: z.boolean().optional(),
  ofwCountry: z.string().optional(),
  isFormerOfw: z.boolean().optional(),
  formerOfwCountry: z.string().optional(),
  ofwReturnDate: z.string().optional(),
  is4PsBeneficiary: z.boolean().optional(),
  householdIdNumber: z.string().optional(),
});

// Step 4: Job Preference
export const jobPreferenceSchema = z.object({
  employmentType: z.enum(["PART_TIME", "FULL_TIME"], {
    message: "Employment type is required",
  }),
  occupation1: z.string().optional(),
  occupation2: z.string().optional(),
  occupation3: z.string().optional(),
  localLocation1: z.string().optional(),
  localLocation2: z.string().optional(),
  localLocation3: z.string().optional(),
  overseasLocation1: z.string().optional(),
  overseasLocation2: z.string().optional(),
  overseasLocation3: z.string().optional(),
});

// Step 5: Language/Dialect
export const languageSchema = z.object({
  english: z
    .object({
      read: z.boolean().optional(),
      write: z.boolean().optional(),
      speak: z.boolean().optional(),
      understand: z.boolean().optional(),
    })
    .optional(),
  filipino: z
    .object({
      read: z.boolean().optional(),
      write: z.boolean().optional(),
      speak: z.boolean().optional(),
      understand: z.boolean().optional(),
    })
    .optional(),
  mandarin: z
    .object({
      read: z.boolean().optional(),
      write: z.boolean().optional(),
      speak: z.boolean().optional(),
      understand: z.boolean().optional(),
    })
    .optional(),
  othersName: z.string().optional(),
  others: z
    .object({
      read: z.boolean().optional(),
      write: z.boolean().optional(),
      speak: z.boolean().optional(),
      understand: z.boolean().optional(),
    })
    .optional(),
});

// Step 6: Education
export const educationSchema = z.object({
  currentlyInSchool: z.boolean().optional(),
  elementary: z
    .object({
      yearGraduated: z.string().optional(),
      levelReached: z.string().optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
  secondary: z
    .object({
      curriculumType: z.enum(["K12", "NON_K12"]).optional(),
      yearGraduated: z.string().optional(),
      levelReached: z.string().optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
  k12: z
    .object({
      yearGraduated: z.string().optional(),
      levelReached: z.string().optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
  seniorHigh: z
    .object({
      strand: z.string().optional(),
      yearGraduated: z.string().optional(),
      levelReached: z.enum(["GRADE_11", "GRADE_12"]).optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
  tertiary: z
    .object({
      course: z.string().optional(),
      yearGraduated: z.string().optional(),
      levelReached: z.string().optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
  graduate: z
    .object({
      course: z.string().optional(),
      yearGraduated: z.string().optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
  postGraduate: z
    .object({
      course: z.string().optional(),
      yearGraduated: z.string().optional(),
      yearLastAttended: z.string().optional(),
    })
    .optional(),
});

// Step 7: Training
export const trainingSchema = z.object({
  entries: z
    .array(
      z.object({
        course: z.string().optional(),
        hours: z.string().optional(),
        institution: z.string().optional(),
        skillsAcquired: z.string().optional(),
        certificates: z
          .object({
            NC_I: z.boolean().optional(),
            NC_II: z.boolean().optional(),
            NC_III: z.boolean().optional(),
            NC_IV: z.boolean().optional(),
            COC: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

// Step 8: Eligibility & License
export const eligibilitySchema = z.object({
  civilService: z
    .array(
      z.object({
        name: z.string().optional(),
        dateTaken: z.string().optional(),
      })
    )
    .optional(),
  professionalLicense: z
    .array(
      z.object({
        name: z.string().optional(),
        validUntil: z.string().optional(),
      })
    )
    .optional(),
});

// Step 9: Work Experience
export const workExperienceSchema = z.object({
  entries: z
    .array(
      z.object({
        companyName: z.string().optional(),
        address: z.string().optional(),
        position: z.string().optional(),
        numberOfMonths: z.string().optional(),
        employmentStatus: z
          .enum(["PERMANENT", "CONTRACTUAL", "PART_TIME", "PROBATIONARY"])
          .optional(),
      })
    )
    .optional(),
});

// Step 10: Skills & Certification
export const skillsSchema = z.object({
  otherSkills: z
    .object({
      auto_mechanic: z.boolean().optional(),
      beautician: z.boolean().optional(),
      carpentry_work: z.boolean().optional(),
      computer_literate: z.boolean().optional(),
      domestic_chores: z.boolean().optional(),
      driver: z.boolean().optional(),
      electrician: z.boolean().optional(),
      embroidery: z.boolean().optional(),
      gardening: z.boolean().optional(),
      masonry: z.boolean().optional(),
      painter_artist: z.boolean().optional(),
      painting_jobs: z.boolean().optional(),
      photography: z.boolean().optional(),
      plumbing: z.boolean().optional(),
      sewing_dresses: z.boolean().optional(),
      stenography: z.boolean().optional(),
      tailoring: z.boolean().optional(),
      others: z.string().optional(),
    })
    .optional(),
  certification: z.object({
    acknowledged: z.boolean().optional(),
    signature: z.string().min(1, "Signature is required"),
    dateSigned: z.string().min(1, "Date signed is required"),
  }),
  pesoUseOnly: z
    .object({
      referralPrograms: z
        .object({
          spes: z.boolean().optional(),
          gip: z.boolean().optional(),
          tupad: z.boolean().optional(),
          jobstart: z.boolean().optional(),
          dileep: z.boolean().optional(),
          tesda_training: z.boolean().optional(),
          others: z.string().optional(),
        })
        .optional(),
      assessedBy: z.string().optional(),
      assessorSignature: z.string().optional(),
      assessmentDate: z.string().optional(),
    })
    .optional(),
});

// Combined schema for final validation
export const jobseekerRegistrationSchema = z.object({
  personalInfo: personalInfoSchema,
  employment: employmentSchema,
  jobPreference: jobPreferenceSchema,
  language: languageSchema,
  education: educationSchema,
  training: trainingSchema,
  eligibility: eligibilitySchema,
  workExperience: workExperienceSchema,
  skills: skillsSchema,
});

export type JobseekerRegistrationData = z.infer<
  typeof jobseekerRegistrationSchema
>;
