/**
 * Escapes characters that are treated as wildcards in SQL LIKE/ILIKE queries.
 * Prevents Wildcard Injection DoS attacks where a user inputs '%' or '_'
 * to cause expensive full-table scans or regex matching.
 *
 * Escapes:
 * - % (percent) -> \%
 * - _ (underscore) -> \_
 * - \ (backslash) -> \\
 */
export function escapeLikeWildcards(query: string): string {
  if (!query) return "";
  return query.replace(/[\\%_]/g, "\\$&");
}

/**
 * Sanitizes a search query string to be safe for use in PostgREST 'or' filters.
 *
 * PostgREST uses commas (,) to separate conditions in an 'or' filter, and parentheses (())
 * for grouping. If a user input containing these characters is injected directly into
 * an 'or' string (e.g. `or(col1.ilike.%${input}%,col2.ilike.%${input}%)`), it can
 * break the query syntax or allow filter injection.
 *
 * This function replaces these characters with spaces to prevent such issues.
 * It also escapes SQL wildcards to prevent DoS attacks.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";

  // First escape SQL wildcards
  const escaped = escapeLikeWildcards(query);

  // Then replace dangerous PostgREST control characters with space and collapse multiple spaces
  return escaped.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}
