import { describe, it } from "node:test";
import assert from "node:assert";
import { mapRecentJobseeker, type OptimizedJobseekerDBRecord } from "./jobseeker-mapper.ts";

describe("mapRecentJobseeker", () => {
  it("should correctly map a complete record", () => {
    const record: OptimizedJobseekerDBRecord = {
      id: 1,
      created_at: "2023-10-27T10:00:00.000Z",
      surname: "Doe",
      first_name: "John",
      date_of_birth: "1990-01-01",
      sex: "Male",
      barangay: "Barangay 1",
      employment_status: "EMPLOYED",
    };

    const result = mapRecentJobseeker(record);

    assert.strictEqual(result.id, 1);
    assert.strictEqual(result.name, "Doe, John");
    assert.strictEqual(result.initials, "DJ");
    assert.strictEqual(result.sex, "Male");
    // Age calculation depends on current date, so we need to be careful.
    // Assuming 2024 or later, age should be > 30.
    // Instead of asserting exact age, let's assert it is a number.
    assert.ok(typeof result.age === "number");
    assert.strictEqual(result.barangay, "Barangay 1");
    assert.strictEqual(result.employmentStatus, "Employed");
    assert.strictEqual(result.dateRegistered, "Oct 27, 2023");
  });

  it("should handle missing optional fields", () => {
    const record: OptimizedJobseekerDBRecord = {
      id: 2,
      created_at: "2023-10-28T10:00:00.000Z",
      surname: null,
      first_name: null,
      date_of_birth: null,
      sex: null,
      barangay: null,
      employment_status: null,
    };

    const result = mapRecentJobseeker(record);

    assert.strictEqual(result.id, 2);
    assert.strictEqual(result.name, "—");
    assert.strictEqual(result.initials, "—");
    assert.strictEqual(result.sex, "—");
    assert.strictEqual(result.age, null);
    assert.strictEqual(result.barangay, "—");
    assert.strictEqual(result.employmentStatus, "—");
    assert.strictEqual(result.dateRegistered, "Oct 28, 2023");
  });

  it("should handle UNEMPLOYED status", () => {
    const record: OptimizedJobseekerDBRecord = {
      id: 3,
      created_at: "2023-10-29T10:00:00.000Z",
      surname: "Smith",
      first_name: "Jane",
      date_of_birth: "1995-05-05",
      sex: "Female",
      barangay: "Barangay 2",
      employment_status: "UNEMPLOYED",
    };

    const result = mapRecentJobseeker(record);

    assert.strictEqual(result.employmentStatus, "Unemployed");
  });
});
