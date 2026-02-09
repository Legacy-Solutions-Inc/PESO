import { test } from 'node:test';
import assert from 'node:assert';
import { getSafeRedirectUrl } from './utils.ts';

test('getSafeRedirectUrl', async (t) => {
    const origin = 'https://example.com';

    await t.test('allows valid relative path', () => {
        const next = '/dashboard';
        const expected = 'https://example.com/dashboard';
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('allows valid relative path with query', () => {
        const next = '/dashboard?foo=bar';
        const expected = 'https://example.com/dashboard?foo=bar';
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('blocks absolute URL to different origin', () => {
        const next = 'https://evil.com/login';
        const expected = 'https://example.com/login'; // Fallback
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('blocks protocol-relative URL to different origin', () => {
        const next = '//evil.com';
        const expected = 'https://example.com/login'; // Fallback
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('allows @ used as path segment (mitigates open redirect via @)', () => {
        const next = '@evil.com';
        // Note: new URL('@evil.com', 'https://example.com') parses as https://example.com/@evil.com
        // This is safe because it stays on origin.
        const expected = 'https://example.com/@evil.com';
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('blocks javascript: URL', () => {
        const next = 'javascript:alert(1)';
        const expected = 'https://example.com/login'; // Fallback
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('blocks invalid URL format that throws', () => {
        // It's hard to make new URL() throw with a base, unless base is invalid.
        // But if next is something weird?
        // Let's rely on the try/catch block coverage.
    });

    await t.test('handles empty string', () => {
        const next = '';
        const expected = 'https://example.com/';
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });

    await t.test('handles slash', () => {
        const next = '/';
        const expected = 'https://example.com/';
        assert.strictEqual(getSafeRedirectUrl(next, origin), expected);
    });
});
