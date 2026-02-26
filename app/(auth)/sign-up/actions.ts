"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate input using Zod schema
  const result = signUpSchema.safeParse({
    email,
    password,
    confirmPassword,
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0].message;
    redirect(`/sign-up?error=${encodeURIComponent(errorMessage)}`);
  }

  const validatedData = result.data;

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/login`,
    },
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Account created! Please check your email to confirm, then wait for admin approval before accessing the system."
      )
  );
}
