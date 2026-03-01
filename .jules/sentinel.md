## 2024-05-23 - Wildcard Injection DoS in PostgREST

**Vulnerability:** User input was passed directly to `ilike` filters in Supabase queries (e.g., `city.ilike.%${input}%`). This allowed users to input wildcards (`%` or `_`), potentially causing expensive full-table scans or regex matching (DoS).

**Learning:** While PostgREST handles SQL injection for the query structure, it does not automatically escape wildcard characters within the pattern string. Developers often overlook this when constructing `ilike` patterns manually.

**Prevention:** Always use a dedicated escaping function (like `escapeLikeWildcards`) to escape `%`, `_`, and `\` before interpolating user input into `ilike` or `like` patterns.
## 2024-03-01 - [CRITICAL] Fix Authorization Bypass in Jobseeker Registration
**Vulnerability:** The Server Actions in `app/(app)/jobseekers/register/actions.ts` (`createJobseeker`, `saveDraft`, `loadDraft`) used `supabase.auth.getUser()` to check for authentication directly. This allowed any user with a valid session (including inactive or pending users) to bypass the intended authorization checks (e.g., role and profile status).
**Learning:** In Next.js Server Actions using Supabase, `supabase.auth.getUser()` only verifies session validity. It does not enforce custom application-level authorization rules (like profile status `active` or roles `admin`/`encoder`).
**Prevention:** Always use centralized authorization wrappers like `requireActiveUser()` or `requireAdmin()` in Server Actions to ensure both authentication and application-specific authorization rules are enforced.
