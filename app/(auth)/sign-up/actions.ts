"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpState = { error?: string };

export async function signUp(
  _prevState: SignUpState | null,
  formData: FormData
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const parsed = signUpSchema.safeParse({ email, password, confirmPassword });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid submission.",
    };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/login`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Account created. Please check your email to confirm, then wait for admin approval before accessing the system."
      )
  );
}
