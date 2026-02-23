"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignUpState = { error?: string };

export async function signUp(
  _prevState: SignUpState | null,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email?.trim()) {
    return { error: "Email is required." };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
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
      encodeURIComponent("Account created! Please check your email to confirm, then wait for admin approval before accessing the system.")
  );
}
