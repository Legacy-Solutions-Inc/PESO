import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { processPasswordReset } from "./logic.ts";

describe("processPasswordReset", () => {
  const origin = "http://localhost:3000";

  test("returns error when email is missing", async () => {
    const formData = new FormData();
    const mockReset = async () => ({ error: null });

    const result = await processPasswordReset(formData, origin, mockReset);
    assert.equal(result.error, "Email is required.");
    assert.equal(result.message, undefined);
  });

  test("returns generic success message when reset succeeds", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    const mockReset = async () => ({ error: null });

    const result = await processPasswordReset(formData, origin, mockReset);
    assert.equal(result.error, undefined);
    assert.match(result.message ?? "", /reset link/i);
  });

  test("returns generic success even when Supabase errors (no enumeration)", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    const mockReset = async () => ({
      error: { message: "User not found" },
    });

    const result = await processPasswordReset(formData, origin, mockReset);

    // Must not surface the underlying error to the client.
    assert.equal(result.error, undefined);
    assert.doesNotMatch(result.message ?? "", /user not found/i);
    assert.match(result.message ?? "", /reset link/i);
  });

  test("redirectTo points to the reset-password landing page", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    let capturedRedirectTo = "";
    const mockReset = async (
      _email: string,
      options: { redirectTo: string }
    ) => {
      capturedRedirectTo = options.redirectTo;
      return { error: null };
    };

    await processPasswordReset(formData, origin, mockReset);
    assert.equal(
      capturedRedirectTo,
      `${origin}/auth/callback?next=/reset-password`
    );
  });
});
