import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeSearchQuery, escapeLikeWildcards } from './search-utils.ts';

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
});
