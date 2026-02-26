import { describe, it } from "node:test";
import assert from "node:assert";
import { passwordSchema, signUpSchema } from "./auth.ts";

describe("Password Validation", () => {
  it("should fail if password is too short", () => {
    const result = passwordSchema.safeParse("Short1!");
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /at least 8 characters/);
    }
  });

  it("should fail if password has no uppercase", () => {
    const result = passwordSchema.safeParse("lowercase1!");
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /uppercase/);
    }
  });

  it("should fail if password has no lowercase", () => {
    const result = passwordSchema.safeParse("UPPERCASE1!");
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /lowercase/);
    }
  });

  it("should fail if password has no number", () => {
    const result = passwordSchema.safeParse("NoNumber!");
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /number/);
    }
  });

  it("should fail if password has no special character", () => {
    const result = passwordSchema.safeParse("NoSpecial1");
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /special character/);
    }
  });

  it("should pass for a valid password", () => {
    const result = passwordSchema.safeParse("ValidP@ssw0rd");
    assert.strictEqual(result.success, true);
  });
});

describe("Sign Up Validation", () => {
  it("should fail if passwords do not match", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "ValidP@ssw0rd",
      confirmPassword: "DifferentP@ssw0rd",
    });
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error.issues[0].message, "Passwords do not match");
    }
  });

  it("should fail for invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "invalid-email",
      password: "ValidP@ssw0rd",
      confirmPassword: "ValidP@ssw0rd",
    });
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /Invalid email/);
    }
  });

  it("should pass for valid sign up data", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "ValidP@ssw0rd",
      confirmPassword: "ValidP@ssw0rd",
    });
    assert.strictEqual(result.success, true);
  });
});
