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
