
import assert from 'node:assert';
import { test } from 'node:test';
import { sanitizeSearchQuery, escapeLikeWildcards } from './search-utils.ts';

test('sanitizeSearchQuery behavior', async (t) => {
    await t.test('does not escape wildcards', () => {
        const input = '%';
        const output = sanitizeSearchQuery(input);
        assert.strictEqual(output, '%', 'Should not escape wildcards yet');
    });

    await t.test('handles parens and commas', () => {
        const input = 'foo,bar(baz)';
        const output = sanitizeSearchQuery(input);
        assert.strictEqual(output, 'foo bar baz', 'Should replace parens and commas with space');
    });
});

test('escapeLikeWildcards behavior', async (t) => {
    await t.test('escapes %', () => {
        const input = 'foo%bar';
        const output = escapeLikeWildcards(input);
        assert.strictEqual(output, 'foo\\%bar', 'Should escape %');
    });

    await t.test('escapes _', () => {
        const input = 'foo_bar';
        const output = escapeLikeWildcards(input);
        assert.strictEqual(output, 'foo\\_bar', 'Should escape _');
    });

    await t.test('escapes \\', () => {
        const input = 'foo\\bar';
        const output = escapeLikeWildcards(input);
        assert.strictEqual(output, 'foo\\\\bar', 'Should escape \\');
    });

    await t.test('escapes mixed wildcards', () => {
        const input = 'a%b_c\\d';
        const output = escapeLikeWildcards(input);
        assert.strictEqual(output, 'a\\%b\\_c\\\\d', 'Should escape all special characters');
    });

    await t.test('handles empty input', () => {
        const input = '';
        const output = escapeLikeWildcards(input);
        assert.strictEqual(output, '', 'Should handle empty input');
    });
});
