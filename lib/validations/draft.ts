import { z } from "zod";
import { jobseekerRegistrationSchema } from "./jobseeker-registration";

/** Schema for draft row from Supabase (snake_case). */
export const draftPayloadSchema = z.object({
  data: jobseekerRegistrationSchema.partial().optional(),
  current_step: z.number(),
  completed_steps: z.array(z.number()),
});

/** Schema for draft object stored in localStorage. */
export const localDraftSchema = z.object({
  encoderEmail: z.string(),
  data: jobseekerRegistrationSchema.partial().optional(),
  currentStep: z.number(),
  completedSteps: z.array(z.number()),
  timestamp: z.union([z.string(), z.number()]).optional(),
});

export type LocalDraft = z.infer<typeof localDraftSchema>;
