/**
 * Escapes PostgREST/SQL wildcard characters (% and _) to ensure they are treated as literals.
 * This prevents users from performing wildcard searches (e.g. searching for '%') which could
 * lead to performance issues (DoS) or unexpected results.
 */
export function escapeLikeWildcards(text: string): string {
  if (!text) return "";
  return text.replace(/[%_]/g, "\\$&");
}

/**
 * Sanitizes a search query string to be safe for use in PostgREST 'or' filters.
 *
 * PostgREST uses commas (,) to separate conditions in an 'or' filter, and parentheses (())
 * for grouping. If a user input containing these characters is injected directly into
 * an 'or' string (e.g. `or(col1.ilike.%${input}%,col2.ilike.%${input}%)`), it can
 * break the query syntax or allow filter injection.
 *
 * This function also escapes wildcard characters (% and _) to prevent wildcard injection.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";

  // First escape wildcards so they are treated as literals
  const escaped = escapeLikeWildcards(query);

  // Then replace dangerous PostgREST control characters with space and collapse multiple spaces
  return escaped.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}
