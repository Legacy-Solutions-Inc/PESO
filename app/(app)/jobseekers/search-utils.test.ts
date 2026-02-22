import { test, describe } from "node:test";
import assert from "node:assert";
import {
  sanitizeSearchQuery,
  escapeLikeWildcards,
  validateSortColumn,
  ALLOWED_SORT_COLUMNS,
} from "./search-utils.ts";

describe("Jobseeker Search Utils", () => {
  describe("escapeLikeWildcards", () => {
    test("should escape %", () => {
      assert.strictEqual(escapeLikeWildcards("100%"), "100\\%");
    });

    test("should escape _", () => {
      assert.strictEqual(escapeLikeWildcards("user_name"), "user\\_name");
    });

    test("should escape \\", () => {
      assert.strictEqual(escapeLikeWildcards("\\"), "\\\\");
    });

    test("should escape multiple occurrences", () => {
      assert.strictEqual(escapeLikeWildcards("%_Test_%"), "\\%\\_Test\\_\\%");
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

    test("should escape SQL wildcards after sanitization", () => {
      assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
      assert.strictEqual(sanitizeSearchQuery("User_Name"), "User\\_Name");
      // Comma replaced by space, then % escaped
      assert.strictEqual(sanitizeSearchQuery("100%, Guaranteed"), "100\\% Guaranteed");
    });
  });

  describe("validateSortColumn", () => {
    test("should allow valid columns", () => {
      ALLOWED_SORT_COLUMNS.forEach((col) => {
        assert.strictEqual(validateSortColumn(col), col);
      });
    });

    test("should return default for invalid columns", () => {
      assert.strictEqual(validateSortColumn("invalid_column"), ALLOWED_SORT_COLUMNS[0]);
      assert.strictEqual(validateSortColumn("drop table users"), ALLOWED_SORT_COLUMNS[0]);
    });

    test("should return default for empty string", () => {
      assert.strictEqual(validateSortColumn(""), ALLOWED_SORT_COLUMNS[0]);
    });
  });
});
