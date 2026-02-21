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

  test("should escape multiple occurrences", () => {
    assert.strictEqual(escapeLikeWildcards("%_Test_%"), "\\%\\_Test\\_\\%");
  });
});

describe("sanitizeSearchQuery", () => {
  test("should handle empty strings", () => {
    assert.strictEqual(sanitizeSearchQuery(""), "");
    // Trims whitespace
    assert.strictEqual(sanitizeSearchQuery("   "), "");
  });

  test("should remove PostgREST control characters ( ) ,", () => {
    assert.strictEqual(sanitizeSearchQuery("test(1),2"), "test 1 2");
  });

  test("should escape wildcards % and _", () => {
    assert.strictEqual(sanitizeSearchQuery("test%_1"), "test\\%\\_1");
  });

  test("should handle both control chars and wildcards", () => {
    assert.strictEqual(sanitizeSearchQuery("test(%)"), "test \\%");
  });

  test("should trim and collapse spaces", () => {
    assert.strictEqual(sanitizeSearchQuery("  test   1  "), "test 1");
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

  test("should escape SQL wildcards after sanitization", () => {
    assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
    assert.strictEqual(sanitizeSearchQuery("User_Name"), "User\\_Name");
    // Comma replaced by space, then % escaped
    assert.strictEqual(sanitizeSearchQuery("100%, Guaranteed"), "100\\% Guaranteed");
  });
});
