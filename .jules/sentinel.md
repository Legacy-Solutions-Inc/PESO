## 2024-05-23 - Wildcard Injection DoS in PostgREST

**Vulnerability:** User input was passed directly to `ilike` filters in Supabase queries (e.g., `city.ilike.%${input}%`). This allowed users to input wildcards (`%` or `_`), potentially causing expensive full-table scans or regex matching (DoS).

**Learning:** While PostgREST handles SQL injection for the query structure, it does not automatically escape wildcard characters within the pattern string. Developers often overlook this when constructing `ilike` patterns manually.

**Prevention:** Always use a dedicated escaping function (like `escapeLikeWildcards`) to escape `%`, `_`, and `\` before interpolating user input into `ilike` or `like` patterns.

## 2024-05-23 - Inconsistent Wildcard Sanitization

**Vulnerability:** User Search (Admin-only) was vulnerable to Wildcard Injection because `escapeLikeWildcards` was only available in the Jobseekers module.
**Learning:** Security utilities tied to specific features are often missed by other features implementing similar logic (e.g., search).
**Prevention:** Centralize security utilities in `lib/` (e.g., `lib/search-utils.ts`) to ensure visibility and consistent application across all modules.
