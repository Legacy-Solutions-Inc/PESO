"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { processPasswordReset } from "./logic";

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const redirectUrl = await processPasswordReset(
    formData,
    origin,
    (email, options) => supabase.auth.resetPasswordForEmail(email, options)
  );

  redirect(redirectUrl);
}
