// Extracted for testing and to ensure secure fetching pattern (avoiding listUsers).
// Typed with the minimum admin-client surface we exercise so tests can pass a mock
// without depending on @supabase/supabase-js inside Node's strip-types runner.
interface AdminUserLookup {
  auth: {
    admin: {
      getUserById(
        userId: string,
      ): Promise<{
        data: { user: { email?: string | null } | null } | null;
        error: { message: string } | null;
      }>;
    };
  };
}

export async function fetchUserEmails(
  adminClient: AdminUserLookup,
  userIds: string[]
): Promise<Record<string, string>> {
  const emailByUserId: Record<string, string> = {};

  // Fetch emails only for the specified users in parallel
  // This avoids the N+1 problem of serial fetching and the security/performance risk of listUsers()
  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const { data, error } = await adminClient.auth.admin.getUserById(userId);
        if (!error && data?.user?.email) {
          emailByUserId[userId] = data.user.email;
        }
      } catch (error) {
        // Log error but continue (email will be empty)
        console.error(`Failed to fetch email for user ${userId}:`, error);
      }
    })
  );

  return emailByUserId;
}
