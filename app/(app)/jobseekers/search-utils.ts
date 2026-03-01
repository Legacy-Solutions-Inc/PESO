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

// Columns that are safe to sort by (must be top-level table columns)
export const ALLOWED_SORT_COLUMNS = [
  "created_at",
  "updated_at",
  "surname",
  "first_name",
  "sex",
  "employment_status",
  "city",
  "province",
  "is_ofw",
  "is_4ps_beneficiary",
];

/**
 * Validates the sort column against a whitelist of allowed columns.
 * Defaults to "created_at" if the column is not allowed.
 */
export function validateSortColumn(column: string): string {
  if (!column || !ALLOWED_SORT_COLUMNS.includes(column)) {
    return "created_at";
  }
  return column;
}
