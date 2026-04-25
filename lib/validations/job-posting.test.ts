import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  JOB_DESCRIPTION_MAX,
  jobPostingInputSchema,
} from "./job-posting.ts";

const baseValid = {
  title: "Job title",
  employer_name: "Sample Employer",
  description: "We are hiring for a role.",
  location: "Lambunao, Iloilo",
  employment_type: "FULL_TIME" as const,
  salary_range_min: null,
  salary_range_max: null,
  application_deadline: "2030-01-01",
  contact_email: null,
  contact_phone: null,
};

describe("jobPostingInputSchema", () => {
  it("accepts a minimal valid input", () => {
    assert.equal(jobPostingInputSchema.safeParse(baseValid).success, true);
  });

  it("rejects an unknown employment_type", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      employment_type: "GIG_ECONOMY",
    });
    assert.equal(result.success, false);
  });

  it("rejects a malformed application_deadline", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      application_deadline: "01/01/2030",
    });
    assert.equal(result.success, false);
  });

  it("rejects a description over the max", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      description: "x".repeat(JOB_DESCRIPTION_MAX + 1),
    });
    assert.equal(result.success, false);
  });

  it("rejects when salary_range_max is less than salary_range_min", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      salary_range_min: 30000,
      salary_range_max: 20000,
    });
    assert.equal(result.success, false);
  });

  it("accepts when only one salary bound is set", () => {
    const minOnly = jobPostingInputSchema.safeParse({
      ...baseValid,
      salary_range_min: 25000,
      salary_range_max: null,
    });
    assert.equal(minOnly.success, true);
    const maxOnly = jobPostingInputSchema.safeParse({
      ...baseValid,
      salary_range_min: null,
      salary_range_max: 50000,
    });
    assert.equal(maxOnly.success, true);
  });

  it("rejects negative salary values", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      salary_range_min: -1,
    });
    assert.equal(result.success, false);
  });

  it("rejects a malformed contact email", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      contact_email: "not-an-email",
    });
    assert.equal(result.success, false);
  });

  it("normalizes empty contact email to null", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      contact_email: "",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.contact_email, null);
    }
  });

  it("normalizes empty contact phone to null", () => {
    const result = jobPostingInputSchema.safeParse({
      ...baseValid,
      contact_phone: "",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.contact_phone, null);
    }
  });
});
