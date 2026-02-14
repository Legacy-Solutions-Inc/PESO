import { test, describe } from "node:test";
import assert from "node:assert";
import { sanitizeSearchQuery, escapeLikeWildcards } from "./search-utils.ts";

describe("escapeLikeWildcards", () => {
  test("should handle empty strings", () => {
    assert.strictEqual(escapeLikeWildcards(""), "");
  });

  test("should escape percent sign", () => {
    assert.strictEqual(escapeLikeWildcards("%"), "\\%");
    assert.strictEqual(escapeLikeWildcards("100%"), "100\\%");
  });

  test("should escape underscore", () => {
    assert.strictEqual(escapeLikeWildcards("_"), "\\_");
    assert.strictEqual(escapeLikeWildcards("user_name"), "user\\_name");
  });

  test("should escape backslash", () => {
    assert.strictEqual(escapeLikeWildcards("\\"), "\\\\");
    assert.strictEqual(escapeLikeWildcards("C:\\Windows"), "C:\\\\Windows");
  });

  test("should handle mixed special characters", () => {
    assert.strictEqual(escapeLikeWildcards("100%_Match\\"), "100\\%\\_Match\\\\");
  });
});

describe("sanitizeSearchQuery", () => {
  test("should handle empty strings", () => {
    assert.strictEqual(sanitizeSearchQuery(""), "");
    // Trims whitespace
    assert.strictEqual(sanitizeSearchQuery("   "), "");
  });

  test("should preserve safe characters", () => {
    assert.strictEqual(sanitizeSearchQuery("John Doe"), "John Doe");
    assert.strictEqual(sanitizeSearchQuery("admin@example.com"), "admin@example.com");
    assert.strictEqual(sanitizeSearchQuery("12345"), "12345");
  });

  test("should replace commas with spaces", () => {
    assert.strictEqual(sanitizeSearchQuery("Smith, John"), "Smith John");
    assert.strictEqual(sanitizeSearchQuery("Smith,John"), "Smith John");
    assert.strictEqual(sanitizeSearchQuery("One,Two,Three"), "One Two Three");
  });

  test("should replace parentheses with spaces", () => {
    assert.strictEqual(sanitizeSearchQuery("John (Jr)"), "John Jr");
    assert.strictEqual(sanitizeSearchQuery("(test)"), "test");
  });

  test("should collapse multiple spaces", () => {
    assert.strictEqual(sanitizeSearchQuery("One,  Two"), "One Two");
    assert.strictEqual(sanitizeSearchQuery("  Trim  Me  "), "Trim Me");
  });

  test("should handle mixed special characters", () => {
    assert.strictEqual(sanitizeSearchQuery("User (Admin), Staff"), "User Admin Staff");
  });

  test("should escape SQL wildcards", () => {
    assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
    assert.strictEqual(sanitizeSearchQuery("user_name"), "user\\_name");
    assert.strictEqual(sanitizeSearchQuery("C:\\"), "C:\\\\");
  });

  test("should escape wildcards AND sanitize PostgREST chars", () => {
    // Input: "Hello, 100% World"
    // Escaped: "Hello, 100\% World"
    // Sanitized: "Hello  100\% World" -> "Hello 100\% World"
    assert.strictEqual(sanitizeSearchQuery("Hello, 100% World"), "Hello 100\\% World");

    // Input: "(User_Name)"
    // Escaped: "(User\_Name)"
    // Sanitized: " User\_Name " -> "User\_Name"
    assert.strictEqual(sanitizeSearchQuery("(User_Name)"), "User\\_Name");
  });
});
