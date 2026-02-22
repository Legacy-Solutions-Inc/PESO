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
 * Allowlist of columns that can be safely used for sorting.
 * This prevents SQL injection or errors from invalid column names.
 */
export const ALLOWED_SORT_COLUMNS = [
  "id",
  "surname",
  "first_name",
  "sex",
  "employment_status",
  "city",
  "province",
  "is_ofw",
  "is_4ps_beneficiary",
  "created_at",
] as const;

/**
 * Validates the sort column against the allowlist.
 * Returns the column if valid, otherwise returns the default column.
 */
export function validateSortColumn(
  column: string | undefined,
  defaultColumn: string = "created_at"
): string {
  if (!column) return defaultColumn;

  // Type assertion is safe here because we're just checking existence
  if (ALLOWED_SORT_COLUMNS.includes(column as any)) {
    return column;
  }

  return defaultColumn;
}
