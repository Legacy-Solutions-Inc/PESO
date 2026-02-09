
export async function processPasswordReset(
  formData: FormData,
  origin: string,
  resetPasswordForEmail: (
    email: string,
    options: { redirectTo: string }
  ) => Promise<{ error: { message: string } | null }>
): Promise<string> {
  const email = formData.get("email") as string;

  if (!email?.trim()) {
    return "/forgot-password?error=" + encodeURIComponent("Email is required.");
  }

  const { error } = await resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/auth/callback?next=/login`,
  });

  if (error) {
    // Log the error for debugging purposes but do not expose it to the user
    console.error("Password reset error:", error.message);
  }

  // Always return success message to prevent user enumeration
  return (
    "/forgot-password?message=" +
    encodeURIComponent("Check your email for the reset link.")
  );
}
