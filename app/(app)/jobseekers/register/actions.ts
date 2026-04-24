"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { cleanFormData } from "@/lib/jobseeker-registration/clean-form-data";
import {
  jobseekerRegistrationSchema,
  type JobseekerRegistrationData,
} from "@/lib/validations/jobseeker-registration";
import { draftPayloadSchema } from "@/lib/validations/draft";

interface ActionResult {
  success?: boolean;
  error?: string;
  id?: string;
  field?: string;
  details?: Array<{ field: string; message: string }>;
}

interface DraftData {
  data: Partial<JobseekerRegistrationData>;
  currentStep: number;
  completedSteps: number[];
}

export async function createJobseeker(
  data: JobseekerRegistrationData
): Promise<ActionResult> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return { error: auth.error ?? "Not authenticated" };
  }

  const cleanedData = cleanFormData(data);
  const parseResult = jobseekerRegistrationSchema.safeParse(cleanedData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0];
    if (!firstError) {
      return { error: parseResult.error.message };
    }
    const fieldPath = firstError.path.join(" → ");
    return {
      error: `Validation Error: ${firstError.message}`,
      field: fieldPath,
      details: parseResult.error.issues.slice(0, 3).map((issue) => ({
        field: issue.path.join(" → "),
        message: issue.message,
      })),
    };
  }

  const validated = parseResult.data;

  try {
    const supabase = await createClient();

    const { data: jobseeker, error } = await supabase
      .from("jobseekers")
      .insert({
        user_id: auth.data.user.id,
        created_by: auth.data.user.email,
        personal_info: validated.personalInfo,
        employment: validated.employment,
        job_preference: validated.jobPreference,
        language: validated.language,
        education: validated.education,
        training: validated.training,
        eligibility: validated.eligibility,
        work_experience: validated.workExperience,
        skills: validated.skills,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.code, error.message);
      return { error: error.message };
    }

    await supabase
      .from("jobseeker_drafts")
      .delete()
      .eq("user_id", auth.data.user.id);

    revalidatePath("/jobseekers");
    return { success: true, id: jobseeker.id.toString() };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create jobseeker" };
  }
}

export async function saveDraft(
  data: Partial<JobseekerRegistrationData>,
  currentStep: number,
  completedSteps: number[]
): Promise<ActionResult> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return { error: auth.error ?? "Not authenticated" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("jobseeker_drafts")
      .upsert(
        {
          user_id: auth.data.user.id,
          data: data,
          current_step: currentStep,
          completed_steps: completedSteps,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Draft save error:", error.code, error.message);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to save draft" };
  }
}

export async function loadDraft(): Promise<DraftData | null> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return null;
  }

  try {
    const supabase = await createClient();

    const { data: draft, error } = await supabase
      .from("jobseeker_drafts")
      .select("data, current_step, completed_steps")
      .eq("user_id", auth.data.user.id)
      .single();

    if (error || !draft) {
      return null;
    }

    const parsed = draftPayloadSchema.safeParse(draft);
    if (!parsed.success) {
      return null;
    }

    return {
      data: parsed.data.data ?? {},
      currentStep: parsed.data.current_step,
      completedSteps: parsed.data.completed_steps,
    };
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}
