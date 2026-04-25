import { z } from "zod";

/**
 * Validation schemas for job_postings. Shared between the admin compose
 * form (RHF resolver) and the Server Actions. Deep checks (employment_type
 * enum, status set, salary range coherence, email format) live here so the
 * DB constraints stay simple.
 */

export const JOB_TITLE_MAX = 200;
export const JOB_EMPLOYER_MAX = 200;
export const JOB_LOCATION_MAX = 200;
export const JOB_DESCRIPTION_MAX = 10000;

export const employmentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "TEMPORARY",
  "INTERNSHIP",
]);
export type EmploymentType = z.infer<typeof employmentTypeSchema>;

export const jobStatusSchema = z.enum([
  "draft",
  "active",
  "closed",
  "archived",
]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

const phpAmountSchema = z
  .number()
  .int()
  .min(0, "Amount cannot be negative")
  .max(99_999_999, "Amount is unrealistic")
  .nullable();

const optionalEmailSchema = z
  .union([
    z.string().trim().email("Enter a valid email address"),
    z.literal(""),
    z.null(),
  ])
  .transform((v) => (v === "" || v === null ? null : v));

const optionalPhoneSchema = z
  .union([z.string().trim(), z.null()])
  .transform((v) => (v === null || v === "" ? null : v))
  .pipe(
    z
      .string()
      .max(50, "Phone is too long")
      .nullable(),
  );

export const jobPostingInputSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(JOB_TITLE_MAX),
    employer_name: z
      .string()
      .trim()
      .min(1, "Employer name is required")
      .max(JOB_EMPLOYER_MAX),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(JOB_DESCRIPTION_MAX, `Description must be at most ${JOB_DESCRIPTION_MAX} characters`),
    location: z
      .string()
      .trim()
      .min(1, "Location is required")
      .max(JOB_LOCATION_MAX),
    employment_type: employmentTypeSchema,
    salary_range_min: phpAmountSchema,
    salary_range_max: phpAmountSchema,
    application_deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date"),
    contact_email: optionalEmailSchema,
    contact_phone: optionalPhoneSchema,
  })
  .superRefine((value, ctx) => {
    const { salary_range_min, salary_range_max } = value;
    if (
      salary_range_min !== null &&
      salary_range_max !== null &&
      salary_range_max < salary_range_min
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salary_range_max"],
        message: "Maximum salary cannot be less than the minimum",
      });
    }
  });
export type JobPostingInput = z.infer<typeof jobPostingInputSchema>;

export const jobPostingIdSchema = z
  .number()
  .int()
  .positive("Job posting id must be a positive integer");
