import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Append one row to public.audit_log. Used by Server Actions that mutate
 * news_posts and job_postings (and other admin-curated CMS tables) so
 * every state-changing op leaves a trail.
 *
 * The audit_log INSERT policy in 20260425000000_create_audit_log.sql
 * allows any authenticated user to insert their own row
 * (auth.uid() = actor_id), so this runs under the caller's session — no
 * service-role escalation needed.
 *
 * Metadata is intentionally tiny: status transitions record { from, to };
 * everything else is `{}`. Never put caption, description, employer name,
 * email, or any free-text content here.
 */
export interface AuditLogRow {
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: number | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(
  supabase: SupabaseClient,
  row: AuditLogRow,
): Promise<{ error: string | null }> {
  if (!row.actorEmail) {
    return { error: "Cannot audit without actor email" };
  }

  const { error } = await supabase.from("audit_log").insert({
    actor_id: row.actorId,
    actor_email: row.actorEmail,
    action: row.action,
    entity_type: row.entityType,
    entity_id: row.entityId,
    metadata: row.metadata ?? {},
  });

  if (error) {
    console.error("audit_log insert failed:", error.code, error.message);
    return { error: error.message };
  }

  return { error: null };
}
