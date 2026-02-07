"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  jobseekerRegistrationSchema,
  type JobseekerRegistrationData,
} from "@/lib/validations/jobseeker-registration";

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

// Helper function to convert empty strings to undefined and fix data type issues
function cleanFormData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanFormData);
  }
  
  if (typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert empty strings to undefined for optional fields
      if (value === '') {
        cleaned[key] = undefined;
      } 
      // Fix training.entries[].certificates if it's an array (should be object)
      else if (key === 'certificates' && Array.isArray(value)) {
        cleaned[key] = {
          NC_I: false,
          NC_II: false,
          NC_III: false,
          NC_IV: false,
          COC: false,
        };
      }
      else if (typeof value === 'object') {
        cleaned[key] = cleanFormData(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  
  return data;
}

export async function createJobseeker(
  data: JobseekerRegistrationData
): Promise<ActionResult> {
  try {
    // Clean empty strings before validation
    const cleanedData = cleanFormData(data);
    
    // Validate with Zod
    const validated = jobseekerRegistrationSchema.parse(cleanedData);

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Insert to Supabase jobseekers table
    const { data: jobseeker, error } = await supabase
      .from("jobseekers")
      .insert({
        user_id: user.id,
        created_by: user.email,
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
      console.error("Supabase insert error:", error);
      return { error: error.message };
    }

    // Delete draft after successful submission
    await supabase
      .from("jobseeker_drafts")
      .delete()
      .eq("user_id", user.id);

    revalidatePath("/jobseekers");
    return { success: true, id: jobseeker.id.toString() };
  } catch (error) {
    // Handle Zod validation errors with detailed messages
    if (error instanceof Error && error.name === 'ZodError') {
      try {
        const zodError = JSON.parse(error.message);
        const firstError = zodError[0];
        const fieldPath = firstError.path.join(' → ');
        return { 
          error: `Validation Error: ${firstError.message}`,
          field: fieldPath,
          details: zodError.slice(0, 3).map((err: { path: string[]; message: string }) => ({
            field: err.path.join(' → '),
            message: err.message
          }))
        };
      } catch {
        return { error: error.message };
      }
    }
    
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
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Upsert draft (insert or update if exists)
    const { error } = await supabase
      .from("jobseeker_drafts")
      .upsert(
        {
          user_id: user.id,
          data: data,
          current_step: currentStep,
          completed_steps: completedSteps,
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error("Draft save error:", error);
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
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: draft, error } = await supabase
      .from("jobseeker_drafts")
      .select("data, current_step, completed_steps")
      .eq("user_id", user.id)
      .single();

    if (error || !draft) {
      return null;
    }

    return {
      data: draft.data,
      currentStep: draft.current_step,
      completedSteps: draft.completed_steps,
    };
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}
