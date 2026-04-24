import { cache } from "react";
import { getUserProfile } from "./get-user-profile";

/**
 * Ensures the user is authenticated and has an 'active' profile status.
 * Both 'admin' and 'encoder' roles are allowed as long as they are active.
 *
 * Called from Server Actions that mutate or read data on behalf of the
 * encoder. RLS is the real authorization boundary; this guard is
 * defence-in-depth so action-layer errors bubble up before we touch the DB.
 */
export const requireActiveUser = cache(async () => {
  const { data, error } = await getUserProfile();

  if (error || !data) {
    return { data: null, error: error || "Not authenticated" };
  }

  if (data.profile.status !== "active") {
    return { data: null, error: "Account not active" };
  }

  if (data.profile.role !== "admin" && data.profile.role !== "encoder") {
    return { data: null, error: "Unauthorized: Invalid role" };
  }

  return { data, error: null };
});
