/**
 * Sanitizes a search query string to be safe for use in PostgREST 'or' filters.
 *
 * PostgREST uses commas (,) to separate conditions in an 'or' filter, and parentheses (())
 * for grouping. If a user input containing these characters is injected directly into
 * an 'or' string (e.g. `or(col1.ilike.%${input}%,col2.ilike.%${input}%)`), it can
 * break the query syntax or allow filter injection.
 *
 * This function replaces these characters with spaces to prevent such issues.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  // Replace dangerous characters with space and collapse multiple spaces
  return query.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Escapes characters that have special meaning in SQL LIKE/ILIKE queries.
 *
 * The characters `%` (wildcard for any sequence of characters) and `_` (wildcard for
 * any single character) are escaped with a backslash. Backslashes themselves are also
 * escaped to prevent them from being interpreted as escape characters for other things.
 *
 * This prevents users from injecting wildcards to perform DoS attacks (e.g. `%%%%%`)
 * or bypass filters.
 */
export function escapeLikeWildcards(query: string): string {
  if (!query) return "";
  return query.replace(/[%_\\]/g, "\\$&");
}
