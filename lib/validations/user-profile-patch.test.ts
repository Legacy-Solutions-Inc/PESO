import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { userProfilePatchSchema } from "./user-profile-patch.ts";

describe("userProfilePatchSchema", () => {
  it("accepts a role-only patch", () => {
    const result = userProfilePatchSchema.safeParse({ role: "admin" });
    assert.equal(result.success, true);
  });

  it("accepts a status-only patch", () => {
    const result = userProfilePatchSchema.safeParse({ status: "active" });
    assert.equal(result.success, true);
  });

  it("accepts a full_name-only patch", () => {
    const result = userProfilePatchSchema.safeParse({
      full_name: "Juan Dela Cruz",
    });
    assert.equal(result.success, true);
  });

  it("rejects unknown fields (strict mode)", () => {
    const result = userProfilePatchSchema.safeParse({
      role: "admin",
      user_id: "spoofed-id",
    });
    assert.equal(result.success, false);
  });

  it("rejects an invalid role value", () => {
    const result = userProfilePatchSchema.safeParse({ role: "superadmin" });
    assert.equal(result.success, false);
  });

  it("rejects an invalid status value", () => {
    const result = userProfilePatchSchema.safeParse({ status: "banned" });
    assert.equal(result.success, false);
  });

  it("rejects an empty patch", () => {
    const result = userProfilePatchSchema.safeParse({});
    assert.equal(result.success, false);
  });

  it("rejects an oversized full_name (>120 chars)", () => {
    const tooLong = "x".repeat(121);
    const result = userProfilePatchSchema.safeParse({ full_name: tooLong });
    assert.equal(result.success, false);
  });
});
