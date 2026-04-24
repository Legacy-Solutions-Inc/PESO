import { z } from "zod";

/**
 * Admin-side profile patch. Only fields an admin may modify via the Users
 * page are listed. Unknown fields are rejected (.strict) so a future caller
 * cannot mutate privileged columns like user_id by passing an untyped blob.
 *
 * An empty patch is rejected so that callers cannot accidentally trigger a
 * bare updated_at bump with no material change.
 */
export const userProfilePatchSchema = z
  .object({
    role: z.enum(["admin", "encoder"]).optional(),
    status: z.enum(["active", "pending", "inactive"]).optional(),
    full_name: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type UserProfilePatch = z.infer<typeof userProfilePatchSchema>;
