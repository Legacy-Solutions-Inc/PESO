"use server";

import { createClient } from "@/lib/supabase/server";
import { processPasswordReset, type ForgotPasswordState } from "./logic";

// NB: do NOT re-export types from this file. Next.js "use server" modules
// are restricted to async-function exports only; a `export type { ... }`
// re-export is miscompiled by Turbopack into a runtime export stub that
// fails with "X is not defined" at module evaluation time. Consumers
// should import the type directly from ./logic.

export async function resetPassword(
  _prevState: ForgotPasswordState | null,
  formData: FormData
): Promise<ForgotPasswordState> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return processPasswordReset(formData, origin, (email, options) =>
    supabase.auth.resetPasswordForEmail(email, options)
  );
}
