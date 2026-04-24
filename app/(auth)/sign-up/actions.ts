"use server";

export type SignUpState = { error?: string };

/**
 * Public self-service sign-up is disabled per SRS FR-UM-01: user accounts
 * shall be created by administrators. This action exists only to return a
 * clear error if a client POSTs to the old form action (e.g. a browser
 * with a cached form).
 */
export async function signUp(
  _prevState: SignUpState | null,
  _formData: FormData
): Promise<SignUpState> {
  return {
    error:
      "Self-service sign-up is disabled. Please contact your administrator to request an account.",
  };
}
