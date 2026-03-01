"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface NotificationSummary {
  pendingUserCount: number;
}

export interface GetNotificationSummaryResult {
  data: NotificationSummary | null;
  error?: string;
}

/**
 * Returns notification counts for the current user (e.g. pending user approvals for admins).
 * Non-admins receive zeros; admins get a count of profiles with status = 'pending'.
 */
export async function getNotificationSummary(): Promise<GetNotificationSummaryResult> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return { data: null, error: auth.error ?? "Not authenticated" };
  }

  if (auth.data.profile.role !== "admin") {
    return { data: { pendingUserCount: 0 } };
  }

  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return { data: null, error: adminCheck.error };
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { pendingUserCount: count ?? 0 } };
}
