export type ForgotPasswordState = {
  error?: string;
  message?: string;
};

/**
 * Pure, testable password-reset logic. Kept decoupled from Supabase so the
 * action can inject the real client while the unit test injects a mock.
 *
 * Security note: the success branch is returned unconditionally when Supabase
 * errors — we do NOT surface "user not found" etc., because that leaks
 * account existence to attackers enumerating emails.
 */
export async function processPasswordReset(
  formData: FormData,
  origin: string,
  resetPasswordForEmail: (
    email: string,
    options: { redirectTo: string }
  ) => Promise<{ error: { message: string } | null }>
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "");

  if (!email.trim()) {
    return { error: "Email is required." };
  }

  const { error } = await resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    // Log the error for server-side debugging, but do not expose it to the
    // client (prevents user enumeration).
    console.error("Password reset error:", error.message);
  }

  return {
    message:
      "If an account exists for that email, you will receive a reset link shortly.",
  };
}
