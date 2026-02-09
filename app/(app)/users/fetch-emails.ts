// Extracted for testing and to ensure secure fetching pattern (avoiding listUsers)
// Using 'any' for adminClient to avoid importing @supabase/supabase-js which might fail in test environment
export async function fetchUserEmails(
  adminClient: any,
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
