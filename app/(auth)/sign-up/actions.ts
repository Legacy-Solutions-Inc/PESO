"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email?.trim()) {
    redirect("/sign-up?error=" + encodeURIComponent("Email is required."));
  }
  if (!password || password.length < 6) {
    redirect(
      "/sign-up?error=" +
        encodeURIComponent("Password must be at least 6 characters.")
    );
  }
  if (password !== confirmPassword) {
    redirect(
      "/sign-up?error=" + encodeURIComponent("Passwords do not match.")
    );
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
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/login?message=" +
      encodeURIComponent("Account created! Please check your email to confirm, then wait for admin approval before accessing the system.")
  );
}
