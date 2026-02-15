import { test, describe } from "node:test";
import assert from "node:assert";
import { sanitizeSearchQuery, escapeLikeWildcards } from "./search-utils.ts";

describe("escapeLikeWildcards", () => {
  test("should escape SQL wildcards", () => {
    assert.strictEqual(escapeLikeWildcards("100%"), "100\\%");
    assert.strictEqual(escapeLikeWildcards("_"), "\\_");
    assert.strictEqual(escapeLikeWildcards("\\"), "\\\\");
  });

  test("should handle empty strings", () => {
    assert.strictEqual(escapeLikeWildcards(""), "");
  });

  test("should preserve safe characters", () => {
    assert.strictEqual(escapeLikeWildcards("abc 123"), "abc 123");
  });

  test("should escape mixed content", () => {
    assert.strictEqual(escapeLikeWildcards("a_b%c\\d"), "a\\_b\\%c\\\\d");
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

  test("should escape SQL wildcards after sanitization", () => {
    assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
    assert.strictEqual(sanitizeSearchQuery("User_Name"), "User\\_Name");
    // Comma replaced by space, then % escaped
    assert.strictEqual(sanitizeSearchQuery("100%, Guaranteed"), "100\\% Guaranteed");
  });
});
