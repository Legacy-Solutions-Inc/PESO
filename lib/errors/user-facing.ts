/**
 * Translates internal/Supabase errors into encoder-friendly copy.
 *
 * Rule: never surface raw Supabase error text, PostgreSQL SQLSTATE codes, or
 * stack traces. If the error is unknown, fall back to a generic message that
 * tells the encoder what to do next ("contact your admin") instead of what
 * went wrong internally.
 */

interface MaybePostgrestError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

interface MaybeError {
  name?: string;
  message?: string;
  code?: string;
}

/**
 * Known Supabase/PostgREST/Postgres codes we translate to encoder copy.
 * Everything else gets the generic fallback.
 */
const KNOWN_CODE_MESSAGES: Record<string, string> = {
  // PostgREST: .single()/.maybeSingle() matched zero rows
  PGRST116: "This record does not exist or has been removed.",
  // PostgreSQL unique_violation — duplicate key
  "23505": "A record with this information already exists. Search for it before creating a new one.",
  // PostgreSQL foreign_key_violation
  "23503": "This change references another record that no longer exists.",
  // PostgreSQL not_null_violation
  "23502": "A required field is missing. Please review the form and try again.",
  // PostgreSQL check_violation
  "23514": "One of the entered values is not allowed. Please review the form.",
  // PostgreSQL insufficient_privilege
  "42501": "Your account does not have permission to perform this action.",
  // Supabase Auth
  invalid_credentials: "The email or password is incorrect.",
  email_not_confirmed: "This account has not confirmed its email address yet.",
  over_request_rate_limit: "Too many requests. Please wait a moment and try again.",
  user_not_found: "No account found with this email address.",
};

const GENERIC_FALLBACK =
  "Something went wrong. Please try again, or contact your administrator if the problem continues.";

/**
 * Convert any error-like value into a single user-facing string.
 *
 * Accepts: PostgrestError, Supabase AuthError, standard Error, or an unknown value.
 * Returns: one short sentence safe to show in a toast, error banner, or form message.
 */
export function toUserFacingMessage(error: unknown): string {
  if (!error) return GENERIC_FALLBACK;

  const maybeCode =
    (error as MaybePostgrestError).code ?? (error as MaybeError).code;
  if (maybeCode && KNOWN_CODE_MESSAGES[maybeCode]) {
    return KNOWN_CODE_MESSAGES[maybeCode];
  }

  const message = (error as MaybeError).message;
  if (typeof message === "string" && message.length > 0) {
    // Only surface message text when it's clearly encoder-facing (we wrote it
    // ourselves, e.g. "Unauthorized", "Not authenticated"). Opaque DB text
    // like "duplicate key value violates unique constraint" falls through.
    if (isEncoderFacing(message)) return message;
  }

  return GENERIC_FALLBACK;
}

/**
 * Heuristic: is this message something we wrote and intended for the encoder?
 * True for short, capitalized, period-or-word-ending messages that don't
 * reference schema, columns, or SQL tokens.
 */
function isEncoderFacing(message: string): boolean {
  if (message.length > 140) return false;
  const forbidden = [
    "violates",
    "constraint",
    "relation",
    "column",
    "schema",
    "SQLSTATE",
    "permission denied",
    "RLS",
    "JWT",
    "syntax error",
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
  ];
  return !forbidden.some((token) => message.includes(token));
}
