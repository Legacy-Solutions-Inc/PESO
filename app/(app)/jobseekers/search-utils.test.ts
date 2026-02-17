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

describe('Jobseeker Search Utils', () => {
  describe('escapeLikeWildcards', () => {
    it('should escape %', () => {
      assert.strictEqual(escapeLikeWildcards('100%'), '100\\%');
    });

    it('should escape _', () => {
      assert.strictEqual(escapeLikeWildcards('user_name'), 'user\\_name');
    });

    it('should escape multiple occurrences', () => {
      assert.strictEqual(escapeLikeWildcards('%_Test_%'), '\\%\\_Test\\_\\%');
    });

    it('should handle empty strings', () => {
      assert.strictEqual(escapeLikeWildcards(''), '');
    });

    it('should handle strings without wildcards', () => {
      assert.strictEqual(escapeLikeWildcards('hello world'), 'hello world');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove PostgREST control characters ( ) ,', () => {
      assert.strictEqual(sanitizeSearchQuery('test(1),2'), 'test 1 2');
    });

    it('should escape wildcards % and _', () => {
      assert.strictEqual(sanitizeSearchQuery('test%_1'), 'test\\%\\_1');
    });

    it('should handle both control chars and wildcards', () => {
      assert.strictEqual(sanitizeSearchQuery('test(%)'), 'test \\%');
    });

    it('should trim and collapse spaces', () => {
      assert.strictEqual(sanitizeSearchQuery('  test   1  '), 'test 1');
    });

    it('should handle empty input', () => {
      assert.strictEqual(sanitizeSearchQuery(''), '');
    });
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
