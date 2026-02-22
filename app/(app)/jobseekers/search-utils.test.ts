import { test, describe } from "node:test";
import assert from "node:assert";
import {
  sanitizeSearchQuery,
  escapeLikeWildcards,
  validateSortColumn,
} from "./search-utils.ts";

describe("Jobseeker Search Utils", () => {
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
      assert.strictEqual(sanitizeSearchQuery("   "), "");
    });

    test("should remove PostgREST control characters", () => {
      assert.strictEqual(sanitizeSearchQuery("test(1),2"), "test 1 2");
    });

    test("should escape wildcards", () => {
      assert.strictEqual(sanitizeSearchQuery("test%_1"), "test\\%\\_1");
    });

    test("should handle both control chars and wildcards", () => {
      assert.strictEqual(sanitizeSearchQuery("test(%)"), "test \\%");
    });

    test("should escape SQL wildcards after sanitization", () => {
      assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
      assert.strictEqual(sanitizeSearchQuery("User_Name"), "User\\_Name");
      // Comma replaced by space, then % escaped
      assert.strictEqual(sanitizeSearchQuery("100%, Guaranteed"), "100\\% Guaranteed");
    });
  });

  describe("validateSortColumn", () => {
    test("should return valid column", () => {
      assert.strictEqual(validateSortColumn("surname"), "surname");
      assert.strictEqual(validateSortColumn("employment_status"), "employment_status");
      assert.strictEqual(validateSortColumn("created_at"), "created_at");
    });

    test("should return default for invalid column", () => {
      assert.strictEqual(validateSortColumn("invalid_col"), "created_at");
      assert.strictEqual(validateSortColumn("drop table users"), "created_at");
    });

    test("should return default for empty/undefined input", () => {
      assert.strictEqual(validateSortColumn(""), "created_at");
      assert.strictEqual(validateSortColumn(undefined), "created_at");
    });

    test("should support custom default", () => {
      assert.strictEqual(validateSortColumn("invalid", "surname"), "surname");
    });
  });
});
