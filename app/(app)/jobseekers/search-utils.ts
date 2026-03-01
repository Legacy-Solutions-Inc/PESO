/**
 * Escapes characters that have special meaning in SQL LIKE/ILIKE clauses.
 *
 * This prevents users from using wildcards (%) or single-character matchers (_)
 * to trigger expensive queries (DoS) or bypass intended filters.
 *
 * It escapes:
 * - % (percent) -> \%
 * - _ (underscore) -> \_
 * - \ (backslash) -> \\
 */
export function escapeLikeWildcards(query: string): string {
  if (!query) return "";
  return query
    .replace(/\\/g, "\\\\") // Must escape backslashes first!
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/**
 * Sanitizes a search query string to be safe for use in PostgREST 'or' filters.
 *
 * PostgREST uses commas (,) to separate conditions in an 'or' filter, and parentheses (())
 * for grouping. If a user input containing these characters is injected directly into
 * an 'or' string (e.g. `or(col1.ilike.%${input}%,col2.ilike.%${input}%)`), it can
 * break the query syntax or allow filter injection.
 *
 * This function:
 * 1. Replaces dangerous control characters (params, commas) with spaces.
 * 2. Escapes SQL wildcards (%, _, \) using escapeLikeWildcards.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  // 1. Replace dangerous characters with space and collapse multiple spaces
  const clean = query.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();

  // 2. Escape SQL wildcards
  return escapeLikeWildcards(clean);
}

/**
 * Validates the sort column against a list of allowed columns.
 *
 * This prevents users from sorting by arbitrary columns, which could lead to:
 * 1. Information disclosure (verifying column existence or internal schema via errors).
 * 2. DoS (sorting by large unindexed columns like JSONB).
 *
 * @param column The input column name to validate.
 * @param allowedColumns The whitelist of allowed column names.
 * @returns The verified column name, or the first allowed column as a default.
 */
export function validateSortColumn(
  column: string,
  allowedColumns: readonly string[]
): string {
  // If no column provided or not in whitelist, return default (first allowed)
  if (!column || !allowedColumns.includes(column)) {
    return allowedColumns.length > 0 ? allowedColumns[0] : "created_at";
  }
  return column;
}
