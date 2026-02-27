import { test, describe } from "node:test";
import assert from "node:assert";
// @ts-ignore
import { signUpSchema } from "./auth.ts";

// @ts-ignore
describe("Sign Up Validation Schema", () => {
  // @ts-ignore
  test("should validate correct inputs", () => {
    const validData = {
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    };
    const result = signUpSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  // @ts-ignore
  test("should fail on invalid email", () => {
    const invalidData = {
      email: "invalid-email",
      password: "Password1!",
      confirmPassword: "Password1!",
    };
    const result = signUpSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error.issues[0].message, "Invalid email address.");
    }
  });

  // @ts-ignore
  test("should fail on weak password (length)", () => {
    const invalidData = {
      email: "test@example.com",
      password: "Pass1!",
      confirmPassword: "Pass1!",
    };
    const result = signUpSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
       // Check if any issue relates to length
       const lengthIssue = result.error.issues.find(i => i.message.includes("at least 8 characters"));
       assert.ok(lengthIssue);
    }
  });

  // @ts-ignore
  test("should fail on weak password (complexity)", () => {
      const invalidData = {
          email: "test@example.com",
          password: "password123", // No uppercase, no special
          confirmPassword: "password123"
      };
      const result = signUpSchema.safeParse(invalidData);
      assert.strictEqual(result.success, false);
  });

  // @ts-ignore
  test("should fail on password mismatch", () => {
    const invalidData = {
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1?",
    };
    const result = signUpSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error.issues[0].message, "Passwords do not match.");
    }
  });
});
