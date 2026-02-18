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
  });

  describe("sanitizeSearchQuery", () => {
    test("should remove PostgREST control characters", () => {
      assert.strictEqual(sanitizeSearchQuery("test(1),2"), "test 1 2");
    });

    test("should escape wildcards", () => {
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
  });

  describe("validateSortColumn", () => {
    const ALLOWED = ["name", "date", "status"];

    test("should return column if allowed", () => {
      assert.strictEqual(validateSortColumn("name", ALLOWED), "name");
      assert.strictEqual(validateSortColumn("status", ALLOWED), "status");
    });

    test("should return default (first allowed) if column not allowed", () => {
      assert.strictEqual(validateSortColumn("admin", ALLOWED), "name");
      assert.strictEqual(validateSortColumn("drop table", ALLOWED), "name");
    });

    test("should return default if column is empty", () => {
      assert.strictEqual(validateSortColumn("", ALLOWED), "name");
    });

    test("should handle empty whitelist", () => {
      assert.strictEqual(validateSortColumn("name", []), "created_at");
    });
  });
});
