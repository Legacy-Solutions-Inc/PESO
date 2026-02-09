"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fetchUserEmails } from "./fetch-emails";

export interface UserListItem {
  id: string;
  email: string;
  profile: {
    id: number;
    role: "admin" | "encoder";
    status: "active" | "pending" | "inactive";
    full_name: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface UsersListFilters {
  search?: string;
  role?: "all" | "admin" | "encoder";
  status?: "all" | "active" | "pending" | "inactive";
  page?: number;
  pageSize?: number;
}

export async function getUsersList(filters: UsersListFilters = {}) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return { data: null, error: adminCheck.error };
  }

  try {
    const supabase = await createClient();
    const {
      search = "",
      role = "all",
      status = "all",
      page = 1,
      pageSize = 20,
    } = filters;

    // Build query (no join to auth.users - not in public schema; we fetch emails via auth.admin below)
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Apply filters
    if (role !== "all") {
      query = query.eq("role", role);
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Search by full_name only (auth.users not joinable from client)
    if (search.trim()) {
      query = query.ilike("full_name", `%${search.trim()}%`);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by created_at descending (newest first)
    query = query.order("created_at", { ascending: false });

    const { data: profiles, error, count } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    // Fetch emails via service role (auth.admin only works with service role key)
    let emailByUserId: Record<string, string> = {};
    const adminClient = createAdminClient();

    // Optimization: Fetch emails only for the displayed users in parallel
    if (adminClient && profiles && profiles.length > 0) {
      const userIds = profiles.map((p) => p.user_id);
      emailByUserId = await fetchUserEmails(adminClient, userIds);
    }

    // Map profiles with user data (email from auth when available, else empty)
    const users: UserListItem[] =
      profiles?.map((profile) => ({
        id: profile.user_id,
        email: emailByUserId[profile.user_id] ?? "",
        profile: {
          id: profile.id,
          role: profile.role as "admin" | "encoder",
          status: profile.status as "active" | "pending" | "inactive",
          full_name: profile.full_name,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        },
      })) ?? [];

    return {
      data: {
        users,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

async function updateUserProfile(
  userId: string,
  updates: Record<string, any>,
  errorMessage: string
) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error || !adminCheck.data) {
    return { success: false, error: adminCheck.error ?? "Unauthorized" };
  }

  try {
    const supabase = await createClient();
    const adminUserId = adminCheck.data.user.id;

    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/users");
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
    };
  }
}

export async function updateUserRole(userId: string, newRole: "admin" | "encoder") {
  return updateUserProfile(userId, { role: newRole }, "Failed to update role");
}

export async function updateUserStatus(
  userId: string,
  newStatus: "active" | "pending" | "inactive"
) {
  return updateUserProfile(
    userId,
    { status: newStatus },
    "Failed to update status"
  );
}

export async function deleteUser(userId: string) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const adminClient = createAdminClient();
    if (!adminClient) {
      return { success: false, error: "Service role key not configured" };
    }

    // Delete from auth.users (will cascade to profiles due to FK)
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/users");
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
