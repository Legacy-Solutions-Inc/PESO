import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import type { JobseekerFiltersInput } from "./filter-query.ts";
import { applyJobseekerFilters } from "./filter-query.ts";

/**
 * Minimal fake of the Supabase query builder used to capture which methods
 * the helper calls and with what args — no database required.
 */
class FakeQuery {
  calls: Array<{ method: string; args: unknown[] }> = [];
  eq(...args: unknown[]) {
    this.calls.push({ method: "eq", args });
    return this;
  }
  ilike(...args: unknown[]) {
    this.calls.push({ method: "ilike", args });
    return this;
  }
  or(...args: unknown[]) {
    this.calls.push({ method: "or", args });
    return this;
  }
  lte(...args: unknown[]) {
    this.calls.push({ method: "lte", args });
    return this;
  }
  gte(...args: unknown[]) {
    this.calls.push({ method: "gte", args });
    return this;
  }
  not(...args: unknown[]) {
    this.calls.push({ method: "not", args });
    return this;
  }
  is(...args: unknown[]) {
    this.calls.push({ method: "is", args });
    return this;
  }
}

describe("applyJobseekerFilters", () => {
  it("applies sex as an eq filter", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q, { sex: "MALE" } as JobseekerFiltersInput);
    assert.deepEqual(q.calls, [{ method: "eq", args: ["sex", "MALE"] }]);
  });

  it("applies search as a sanitized or-ilike across surname and first_name", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(
      q,
      { search: "Dela Cruz" } as JobseekerFiltersInput
    );
    assert.equal(q.calls.length, 1);
    assert.equal(q.calls[0].method, "or");
    const orString = String(q.calls[0].args[0]);
    assert.ok(
      orString.includes("surname.ilike.%Dela Cruz%"),
      "search should include surname clause"
    );
    assert.ok(
      orString.includes("first_name.ilike.%Dela Cruz%"),
      "search should include first_name clause"
    );
  });

  it("converts ageMin into a dateOfBirth upper bound (lte)", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q, { ageMin: "18" } as JobseekerFiltersInput);
    assert.equal(q.calls.length, 1);
    assert.equal(q.calls[0].method, "lte");
    assert.equal(q.calls[0].args[0], "personal_info->>dateOfBirth");
  });

  it("converts ageMax into a dateOfBirth lower bound (gte)", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q, { ageMax: "65" } as JobseekerFiltersInput);
    assert.equal(q.calls.length, 1);
    assert.equal(q.calls[0].method, "gte");
    assert.equal(q.calls[0].args[0], "personal_info->>dateOfBirth");
  });

  it("ignores unrecognised skillType values (whitelist)", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(
      q,
      { skillType: "not_a_real_skill" } as JobseekerFiltersInput
    );
    assert.equal(q.calls.length, 0);
  });

  it("accepts a whitelisted skillType and builds the JSONB path", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(
      q,
      { skillType: "carpentry_work" } as JobseekerFiltersInput
    );
    assert.deepEqual(q.calls, [
      {
        method: "eq",
        args: ["skills->otherSkills->>carpentry_work", "true"],
      },
    ]);
  });

  it("ignores unrecognised referralProgram values", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(
      q,
      { referralProgram: "made_up_program" } as JobseekerFiltersInput
    );
    assert.equal(q.calls.length, 0);
  });

  it("applies hasCertificates='false' as is-null", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(
      q,
      { hasCertificates: "false" } as JobseekerFiltersInput
    );
    assert.deepEqual(q.calls, [
      { method: "is", args: ["training->entries->0", null] },
    ]);
  });
});
