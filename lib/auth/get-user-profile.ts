import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export interface UserProfile {
  id: number;
  user_id: string;
  role: "admin" | "encoder";
  status: "pending" | "active" | "inactive";
  full_name: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface UserWithProfile {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile;
}

export const getUserProfile = cache(async (): Promise<{
  data: UserWithProfile | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: "Profile not found" };
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email ?? "",
        },
        profile: profile as UserProfile,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
