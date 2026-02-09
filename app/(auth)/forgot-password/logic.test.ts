import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { processPasswordReset } from "./logic.ts";

describe("processPasswordReset", () => {
  const origin = "http://localhost:3000";

  test("returns error when email is missing", async () => {
    const formData = new FormData();
    const mockReset = async (email: string, options: any) => ({ error: null });

    const result = await processPasswordReset(formData, origin, mockReset);
    assert.match(result, /error=Email%20is%20required/);
  });

  test("returns success message when reset succeeds", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    const mockReset = async (email: string, options: any) => ({ error: null });

    const result = await processPasswordReset(formData, origin, mockReset);
    assert.match(result, /message=Check%20your%20email/);
  });

  test("returns success message when reset fails (Security Fix)", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    const mockReset = async (email: string, options: any) => ({
      error: { message: "User not found" }
    });

    const result = await processPasswordReset(formData, origin, mockReset);

    // Should not reveal error
    assert.doesNotMatch(result, /error=User%20not%20found/);
    // Should show generic success
    assert.match(result, /message=Check%20your%20email/);
  });
});
