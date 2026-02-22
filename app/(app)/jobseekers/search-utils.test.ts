import { test, describe } from "node:test";
import assert from "node:assert";
import {
  sanitizeSearchQuery,
  escapeLikeWildcards,
  validateSortColumn,
} from "./search-utils.ts";

describe("Jobseeker Search Utils", () => {
  describe("escapeLikeWildcards", () => {
    test("should escape %", () => {
      assert.strictEqual(escapeLikeWildcards("100%"), "100\\%");
    });

    test("should escape _", () => {
      assert.strictEqual(escapeLikeWildcards("user_name"), "user\\_name");
    });

    test("should escape backslashes", () => {
      assert.strictEqual(escapeLikeWildcards("\\"), "\\\\");
    });

    test("should escape multiple occurrences", () => {
      assert.strictEqual(escapeLikeWildcards("%_Test_%"), "\\%\\_Test\\_\\%");
    });

    test("should handle empty strings", () => {
      assert.strictEqual(escapeLikeWildcards(""), "");
    });

    test("should handle strings without wildcards", () => {
      assert.strictEqual(escapeLikeWildcards("hello world"), "hello world");
    });

    test("should preserve safe characters", () => {
      assert.strictEqual(escapeLikeWildcards("abc 123"), "abc 123");
    });

    test("should escape mixed content", () => {
      assert.strictEqual(escapeLikeWildcards("a_b%c\\d"), "a\\_b\\%c\\\\d");
    });
  });

  describe("sanitizeSearchQuery", () => {
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

    test("should handle empty input", () => {
      assert.strictEqual(sanitizeSearchQuery(""), "");
    });

    test("should escape SQL wildcards", () => {
      assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
      assert.strictEqual(sanitizeSearchQuery("user_name"), "user\\_name");
      assert.strictEqual(sanitizeSearchQuery("C:\\"), "C:\\\\");
    });

    test("should escape wildcards AND sanitize PostgREST chars", () => {
      assert.strictEqual(
        sanitizeSearchQuery("Hello, 100% World"),
        "Hello 100\\% World"
      );
      assert.strictEqual(sanitizeSearchQuery("(User_Name)"), "User\\_Name");
    });

    test("should escape SQL wildcards after sanitization", () => {
      assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
      assert.strictEqual(sanitizeSearchQuery("User_Name"), "User\\_Name");
      assert.strictEqual(
        sanitizeSearchQuery("100%, Guaranteed"),
        "100\\% Guaranteed"
      );
    });
  });

  describe("validateSortColumn", () => {
    test("should allow valid columns", () => {
      assert.strictEqual(validateSortColumn("surname"), "surname");
      assert.strictEqual(validateSortColumn("first_name"), "first_name");
      assert.strictEqual(validateSortColumn("created_at"), "created_at");
      assert.strictEqual(validateSortColumn("id"), "id");
    });

    test("should return default for invalid columns", () => {
      assert.strictEqual(validateSortColumn("password"), "created_at");
      assert.strictEqual(validateSortColumn("random_col"), "created_at");
      assert.strictEqual(validateSortColumn(""), "created_at");
    });

    test("should return default for undefined/null", () => {
      assert.strictEqual(validateSortColumn(undefined), "created_at");
      // @ts-expect-error - testing JS runtime behavior
      assert.strictEqual(validateSortColumn(null), "created_at");
    });
  });
});
