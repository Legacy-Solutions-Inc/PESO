"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePasswordSchema } from "@/lib/validations/auth";

export type ResetPasswordState = { error?: string };

export async function updatePassword(
  _prevState: ResetPasswordState | null,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const parsed = updatePasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid submission.",
    };
  }

  const supabase = await createClient();

  // The user must already have a valid session — either a normal login or a
  // recovery session established by clicking the email link (code exchanged
  // by /auth/callback). If there's no session, updateUser fails with a clear
  // error that we surface instead of crashing.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Your reset link is invalid or has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  // Sign out the recovery session so the user re-authenticates with the new
  // password. This prevents a half-authenticated session sticking around.
  await supabase.auth.signOut();

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Password updated. Please sign in with your new password."
      )
  );
}
