"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email?.trim()) {
    redirect(
      "/forgot-password?error=" + encodeURIComponent("Email is required.")
    );
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/callback?next=/login`,
  });

  if (error) {
    redirect(
      "/forgot-password?error=" + encodeURIComponent(error.message)
    );
  }

  redirect(
    "/forgot-password?message=" +
      encodeURIComponent("Check your email for the reset link.")
  );
}
