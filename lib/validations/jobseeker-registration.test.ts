import { test, describe } from "node:test";
import assert from "node:assert";
import { personalInfoSchema } from "./jobseeker-registration.ts";

describe("personalInfoSchema", () => {
  const validData = {
    surname: "Doe",
    firstName: "John",
    middleName: "Quincy",
    suffix: "JR",
    dateOfBirth: "1990-01-01",
    placeOfBirth: "Manila",
    sex: "MALE",
    religion: "Catholic",
    civilStatus: "SINGLE",
    address: {
      houseStreet: "123 Main St",
      barangay: "San Lorenzo",
      city: "Makati",
      province: "Metro Manila",
    },
    tin: "123-456-789",
    disability: {
      visual: false,
      hearing: false,
      speech: false,
      physical: false,
      mental: false,
      others: "",
    },
    height: "175cm",
    contactNumber: "09123456789",
    email: "john.doe@example.com",
  };

  test("should validate correct data", () => {
    const result = personalInfoSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  test("should validate minimum required data", () => {
    const minData = {
      surname: "Doe",
      firstName: "John",
      dateOfBirth: "1990-01-01",
      sex: "MALE",
      civilStatus: "SINGLE",
      address: {},
      disability: {},
    };
    const result = personalInfoSchema.safeParse(minData);
    assert.strictEqual(result.success, true);
  });

  test("should fail if surname is missing", () => {
    const { surname, ...invalidData } = validData;
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.path.includes("surname")));
    }
  });

  test("should fail if firstName is missing", () => {
    const { firstName, ...invalidData } = validData;
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.path.includes("firstName")));
    }
  });

  test("should fail if dateOfBirth is missing", () => {
    const { dateOfBirth, ...invalidData } = validData;
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.path.includes("dateOfBirth")));
    }
  });

  test("should fail if sex is missing", () => {
    const { sex, ...invalidData } = validData;
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.path.includes("sex")));
    }
  });

  test("should fail if civilStatus is missing", () => {
    const { civilStatus, ...invalidData } = validData;
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.path.includes("civilStatus")));
    }
  });

  test("should fail with invalid sex enum", () => {
    const invalidData = { ...validData, sex: "OTHER" };
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
  });

  test("should fail with invalid civilStatus enum", () => {
    const invalidData = { ...validData, civilStatus: "DIVORCED" };
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
  });

  test("should fail with invalid suffix enum", () => {
    const invalidData = { ...validData, suffix: "VI" };
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
  });

  test("should fail with invalid email format", () => {
    const invalidData = { ...validData, email: "invalid-email" };
    const result = personalInfoSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.errors.some((e) => e.message === "Invalid email address"));
    }
  });
});
