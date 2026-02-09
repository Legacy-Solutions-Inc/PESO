import { cache } from "react";
import { getUserProfile } from "./get-user-profile";

export const requireAdmin = cache(async () => {
  const { data, error } = await getUserProfile();

  if (error || !data) {
    return { data: null, error: error || "Not authenticated" };
  }

  if (data.profile.role !== "admin") {
    return { data: null, error: "Unauthorized: Admin access required" };
  }

  if (data.profile.status !== "active") {
    return { data: null, error: "Account not active" };
  }

  return { data, error: null };
});
