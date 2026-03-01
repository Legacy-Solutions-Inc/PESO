import { test, describe, it } from "node:test";
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

  test("should escape SQL wildcards", () => {
    assert.strictEqual(sanitizeSearchQuery("100%"), "100\\%");
    assert.strictEqual(sanitizeSearchQuery("user_name"), "user\\_name");
    assert.strictEqual(sanitizeSearchQuery("C:\\"), "C:\\\\");
  });
});

  test("should fallback to default for invalid columns", () => {
    assert.strictEqual(validateSortColumn("password"), "created_at");
    assert.strictEqual(validateSortColumn("admin"), "created_at");
    assert.strictEqual(validateSortColumn("select * from users"), "created_at");
    assert.strictEqual(validateSortColumn("personal_info->>civilStatus"), "created_at");
  });

  test("should fallback to default for empty input", () => {
    assert.strictEqual(validateSortColumn(""), "created_at");
  });

  test("should fallback to default for unknown columns", () => {
    assert.strictEqual(validateSortColumn("random_col"), "created_at");
  });
});
