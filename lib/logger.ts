/**
 * Vercel-native structured logger.
 *
 * In production: emits one-line JSON to stdout / stderr so Vercel's Logs
 * UI can filter by level, route, action, requestId, userId.
 *
 * In dev: pretty-prints with the same fields so the developer console
 * stays readable.
 *
 * Critical: NEVER log jobseeker PII through this logger. The
 * audit_log table is the source of truth for "who did what to which
 * citizen record"; this logger is for ops (latency, error codes, route
 * names, function failures). Stripping is enforced by `sanitize()` —
 * any field name in PII_KEYS is replaced with "<redacted>" before the
 * line is emitted.
 */

export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  /** Vercel request id; read from headers when available. */
  requestId?: string | null;
  /** Acting user's auth.uid() when known. Email is allowed for staff actors only — never for jobseekers. */
  userId?: string | null;
  /** Route or page path (e.g. "/jobseekers", "/api/health"). */
  route?: string;
  /** Server Action or RPC name (e.g. "deleteJobseeker", "createJobseeker"). */
  action?: string;
  /** Stable error code (e.g. "VALIDATION_ERROR", "RPC_ERROR", "RLS_DENIED"). */
  code?: string;
  /** Generic numeric / string metadata. PII keys are stripped. */
  [k: string]: unknown;
}

// Field names whose values are jobseeker PII and must never be logged,
// regardless of where they appear in the context object.
const PII_KEYS = new Set([
  "surname",
  "first_name",
  "firstName",
  "middle_name",
  "middleName",
  "full_name",
  "fullName",
  "name",
  "email",
  "contact_number",
  "contactNumber",
  "phone",
  "tel",
  "tin",
  "date_of_birth",
  "dateOfBirth",
  "dob",
  "address",
  "house_street",
  "houseStreet",
  "barangay",
  "city",
  "province",
  "jobseeker_id",
  "jobseekerId",
  "personal_info",
  "personalInfo",
]);

const REDACTED = "<redacted>";

function sanitize(input: unknown, depth = 0): unknown {
  if (depth > 4) return REDACTED;
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) {
    return input.map((v) => sanitize(v, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (PII_KEYS.has(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = sanitize(value, depth + 1);
  }
  return out;
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function emit(level: LogLevel, msg: string, ctx: LogContext): void {
  const sanitized = sanitize(ctx) as Record<string, unknown>;
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...sanitized,
  };

  if (isProd()) {
    const json = JSON.stringify(line);
    if (level === "error") console.error(json);
    else if (level === "warn") console.warn(json);
    else console.log(json);
    return;
  }

  // Dev: pretty single line so the terminal stays scannable.
  const pieces = Object.entries(line)
    .filter(([k]) => k !== "ts" && k !== "level" && k !== "msg")
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" ");
  const tag =
    level === "error" ? "ERROR" : level === "warn" ? "WARN " : "INFO ";
  const fn =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(`[${tag}] ${msg}${pieces ? " | " + pieces : ""}`);
}

export const logger = {
  info(msg: string, ctx: LogContext = {}): void {
    emit("info", msg, ctx);
  },
  warn(msg: string, ctx: LogContext = {}): void {
    emit("warn", msg, ctx);
  },
  error(msg: string, ctx: LogContext = {}): void {
    emit("error", msg, ctx);
  },
};
