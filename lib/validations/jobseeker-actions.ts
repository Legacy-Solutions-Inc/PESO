import { z } from "zod";

export const jobseekerIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .finite();

export const jobseekerIdsSchema = z
  .array(jobseekerIdSchema)
  .min(1, "At least one id is required")
  .max(500, "Cannot delete more than 500 records at once");

export type JobseekerId = z.infer<typeof jobseekerIdSchema>;
export type JobseekerIds = z.infer<typeof jobseekerIdsSchema>;
