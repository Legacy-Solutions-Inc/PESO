# Pre-mortem — PESO Lambunao production launch

The PESO Lambunao NSRP system ships a staff-only encoder dashboard (Admin / Encoder / Viewer) backed by Supabase RLS plus a public-facing landing surface (`/`, `/news`, `/jobs`, `/privacy`) curated by admins through the staff side. Production Supabase is provisioned, the codebase is feature-complete for the launch scope, and the public site has been integrated end-to-end with the same database via anon-side queries. This document catalogs the failure modes that could turn that launch into a public incident in the first 90 days, then prioritizes them into work that must ship before go-live versus follow-ups that can be tracked after.

---

## Failure modes

| ID | Failure mode | Root cause category | Likelihood | Severity | Warning signs we'd see beforehand | Pre-launch remediation |
|---:|---|---|---:|---:|---|---|
| F1 | **Anon visitor reads draft news posts, archived posts, or future-scheduled posts via direct query, exposing unfinished announcements.** | RLS / privacy | medium | high | Draft titles appearing in network responses; `select * from news_posts` returning rows where `status != 'published'` for an anon JWT. | RLS smoke test (Step 2) asserts anon sees only `status='published' AND published_at <= now()`. Migration `20260425010000_create_news_and_jobs.sql` already encodes this; smoke verifies. |
| F2 | **Anon visitor reads expired job postings on `/jobs`, applying to closed openings.** | RLS / privacy | medium | medium | Expired posting visible at `/jobs/{id}` past the deadline; rows returned by anon where `application_deadline < current_date`. | RLS smoke asserts anon sees only `status='active' AND application_deadline >= current_date`. |
| F3 | **Anon (or any non-admin) reads `public.jobseekers` rows, leaking citizen PII at scale.** | RLS / privacy | low | **catastrophic** | Anon select returns rows; service-role-shaped queries succeed without auth. | RLS smoke runs `select * from jobseekers` as anon and asserts zero rows / permission-denied. Migration `20260301000100_tighten_jobseekers_rls.sql` already gates by `public.is_active_user()`; smoke verifies the gate is intact in prod. |
| F4 | **Non-admin reads or writes `public.audit_log`, allowing log tampering or ops surveillance.** | RLS / privacy | low | high | Audit rows visible to encoder; insert from non-admin succeeds; update/delete possible from any role. | RLS smoke (Step 2) attempts SELECT/INSERT/UPDATE/DELETE as anon and as a non-admin authenticated session and asserts each path is denied. Migration `20260425000000_create_audit_log.sql` is append-only by design. |
| F5 | **A Server Action accepts an unvalidated input shape (e.g. arbitrary jobseeker id, oversized file, malformed JSONB) and corrupts data or crashes a function.** | data integrity | medium | medium | Production logs show `ZodError` only intermittently; some actions accept `id: any`. | Audit every `"use server"` file for top-of-function `safeParse`. The deletes already validate via `lib/validations/jobseeker-actions.ts`; verify every other action does too. Logger (Step 4) captures `ZodError` to the `error` channel for ops visibility. |
| F6 | **Supabase Storage `public-media` bucket misconfigured: missing public flag, missing MIME allowlist, or oversize cap unset.** | data integrity / privacy | low | medium | Uploads fail; or worse, arbitrary file types accepted (e.g. `text/html` allowing stored-XSS via direct bucket access). | Migration `20260425020000_set_public_media_mime_allowlist.sql` constrains MIME to `[jpeg, png, webp, gif]`. **Finding F6.1**: `image/gif` is on the allowlist but the conventions doc says only webp/jpeg/png. Tighten in a follow-up migration; document the gap in the runbook. |
| F7 | **Supabase Auth Site URL or Redirect URL configured for staging / localhost only — login emails and password resets break on the production domain.** | deployment / env | medium | high | Test logins from production host return "redirect_to mismatch" or land on the wrong origin. | Runbook documents the exact Supabase Dashboard → Authentication → URL Configuration values to set: `Site URL = https://<production-domain>`; `Redirect URLs += https://<production-domain>/auth/callback, https://<production-domain>/reset-password`. Owner verifies before DNS cutover. |
| F8 | **A production env var leaks via `NEXT_PUBLIC_*` — most likely the service-role key being exposed to the browser bundle.** | deployment / env | low | **catastrophic** | Bundle inspection shows `SUPABASE_SERVICE_ROLE_KEY` reachable from client code; logs reference `process.env.SUPABASE_SERVICE_ROLE_KEY` inside a `"use client"` file. | Audit (Step 3a) greps every `process.env.NEXT_PUBLIC_*` reference and confirms only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` exist. No `SUPABASE_SERVICE_ROLE_KEY` reference anywhere outside Server Components / Server Actions / route handlers. |
| F9 | **Production migrations drift from `supabase/migrations/*` — code expects an RPC or column that is not deployed.** | deployment / data integrity | medium | high | First Server Action call after deploy errors with "function … does not exist" or "column … does not exist". | Runbook documents the verification command (`supabase migration list --db-url $PROD_DB_URL`) and lists every migration filename in deploy order. Owner runs it pre-cutover; any drift blocks the launch. |
| F10 | **Image compression bypassed — uploader sends a 10 MB original, Server Action body limit eats it, photo never reaches storage.** | performance / UX | medium | medium | Upload errors surfacing in admin news compose; raw `image/heic` from iOS being rejected. | `lib/image/compress.ts` runs client-side; the bucket MIME allowlist (Step 6) and the 5 MB body cap in `next.config.ts` are the two defensive walls. Playwright `admin-cms.spec.ts` posts a tiny 1×1 PNG to ensure the happy path is wired. |
| F11 | **No `/privacy` content / no robots.txt / no sitemap.xml / missing OG tags — the public site is unfindable, mis-indexed, or non-compliant with the Data Privacy Act.** | legal / SEO | high | medium | `curl /robots.txt` returns 404; Lighthouse SEO audit fails; `/privacy` shows TODO placeholders. | Step 3c: `app/robots.ts`, `app/sitemap.ts`, per-page `<title>` + `<meta name="description">`, OG image on every news detail page. `/privacy` already exists with placeholder address + DPO email marked `{/* TODO */}` for the owner to replace; no other TODOs in user-facing copy. |
| F12 | **Vercel function cold-start exceeds Supabase Auth's 10-second token-refresh timeout, returning "AuthApiError: Token refresh failed" to the user on first hit after idle.** | performance | medium | low | Sporadic login failures after 5+ minutes idle; user reports needing to "refresh and try again". | Migrations and Server Actions stay simple; cold start should be < 1s. If the issue surfaces, route the Supabase client through the Supabase pooler (transaction mode) — the runbook specifies the pooler URL. |
| F13 | **No incident runbook — when a problem hits at 11 PM, no one knows where logs are, how to roll back, or who to call.** | observability | high | medium | First on-call incident requires reverse-engineering Vercel + Supabase from scratch. | `docs/runbook.md` (Step 8) covers logs, audit_log queries, rollback, common errors, and DPO escalation. |
| F14 | **No rollback plan — a regression goes live and there's no documented "promote previous deployment" or "revert migration" procedure.** | deployment | medium | high | A bad deploy stays live for hours while devs improvise. | Runbook documents Vercel "Promote previous deployment" (zero-downtime rollback) and the migration rollback policy: forward-only with a manually-authored compensating migration; no `down.sql`. |
| F15 | **Password-reset email never arrives — the production domain is not configured in Supabase Auth, or DNS for the sending domain is missing SPF / DKIM.** | deployment / email | medium | medium | Users who request reset never receive the email; bounce logs in the email provider show the reset email rejected. | Runbook documents: in Supabase Dashboard → Authentication → Email Templates, the `Reset Password` template uses `{{ .SiteURL }}/reset-password?…`. `Site URL` is set to the production domain. Owner verifies a test reset email lands. |
| F16 | **Admin routes (`/dashboard`, `/admin/*`, `/jobseekers/*`, `/users/*`) get indexed by Google because robots.txt is missing or misconfigured, and the staff side appears in public search.** | SEO / privacy | medium | medium | Google search for `site:<domain> dashboard` returns hits; admin login URL appears in search-engine cache. | `app/robots.ts` (Step 3c) explicitly disallows `/dashboard`, `/admin/*`, `/jobseekers`, `/jobseekers/*`, `/users`, `/users/*`, `/notifications`, `/api/*`. Sitemap.xml only lists public routes. Production robots header is `noindex` on staging environment via header rule. |
| F17 | **A 500 error renders `error.message` or `error.stack` to the visitor, leaking file paths, table names, or env hints.** | observability / privacy | medium | medium | Browser shows "Error: connection to 'aws-0-…' failed" or shows a Next.js error overlay in production. | Audit `app/(app)/error.tsx`, `app/(auth)/error.tsx`, `app/not-found.tsx`, and add `app/(public)/error.tsx`. Each renders a friendly message + opaque digest only. The Next.js production build already strips stack traces; verify in build output. |

### F6.1 — Bucket MIME allowlist tightening (follow-up)

The bucket currently permits `image/gif` per `20260425020000_set_public_media_mime_allowlist.sql`. The conventions doc and the launch runbook list webp/jpeg/png only. Recommended follow-up migration tightens to `[image/webp, image/jpeg, image/png]`. Documented as P3 in the runbook; not blocking launch.

---

## RLS smoke

> **Status:** Documented queries with expected outcomes. The script at `scripts/rls-smoke.ts` runs them against any `SUPABASE_URL` + `SUPABASE_ANON_KEY` and emits structured results. The owner runs it against the production project as a pre-cutover gate; the result lands in this section before flipping DNS.

Each check uses an anon-keyed Supabase client. Synthetic data only.

### S1 — `news_posts`: anon sees only currently-published

```sql
-- Setup (admin / service role; not part of the smoke):
insert into public.news_posts (caption, status, published_at, author_id)
values
  ('Smoke A — published & live', 'published', now() - interval '1 minute', '<author-uuid>'),
  ('Smoke B — draft',            'draft',     null,                          '<author-uuid>'),
  ('Smoke C — archived',         'archived',  now() - interval '1 hour',     '<author-uuid>'),
  ('Smoke D — future-scheduled', 'published', now() + interval '1 hour',     '<author-uuid>');

-- As anon:
select id, caption, status, published_at
from public.news_posts
where caption like 'Smoke %';
```

**Expected:** exactly one row — `Smoke A`. Drafts, archived, and future-scheduled rows are filtered by RLS. (Existing test: `app/(public)/_data/rls-smoke.test.ts` asserts the same shape against a local stack.)

### S2 — `job_postings`: anon sees only active + not expired

```sql
-- Setup:
insert into public.job_postings (
  title, employer_name, description, location, employment_type,
  application_deadline, status, posted_at, created_by
) values
  ('Smoke active future', 'Smoke Co', '…', 'City', 'FULL_TIME',
    current_date + 7, 'active', now(), '<author-uuid>'),
  ('Smoke draft',          'Smoke Co', '…', 'City', 'FULL_TIME',
    current_date + 7, 'draft', null,    '<author-uuid>'),
  ('Smoke active expired', 'Smoke Co', '…', 'City', 'FULL_TIME',
    current_date - 1, 'active', now(), '<author-uuid>');

-- As anon:
select id, title, status, application_deadline
from public.job_postings
where title like 'Smoke %';
```

**Expected:** exactly one row — `Smoke active future`.

### S3 — `jobseekers`: anon sees nothing

```sql
-- As anon:
select id from public.jobseekers limit 5;
```

**Expected:** zero rows. (RLS policy `Active users can read jobseekers` requires `public.is_active_user()`, which is `false` for the anon role.) A permission-denied error from PostgREST is acceptable equivalent.

### S4 — `audit_log`: anon sees nothing, non-admin sees nothing, no UPDATE / DELETE policies exist

```sql
-- As anon:
select id from public.audit_log limit 5;
-- → expect zero rows.

-- Verify policies:
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'audit_log'
order by cmd;
-- Expect exactly two rows:
--   INSERT  → "Actors can insert own audit rows"  (with check auth.uid() = actor_id)
--   SELECT  → "Admins can read audit log"          (admin profile check)
-- No UPDATE, no DELETE policies. (Append-only by omission.)
```

**Expected:** anon select returns zero. Policy listing shows exactly the two rows above.

### S5 — Storage bucket `public-media` MIME allowlist

```sql
select id, public, allowed_mime_types
from storage.buckets
where id = 'public-media';
```

**Expected:** `public = true`, `allowed_mime_types ⊇ [image/webp, image/jpeg, image/png]`. (Currently also includes `image/gif` — see F6.1.)

### S6 — Per-table RLS-enabled survey

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

**Expected:** `rowsecurity = t` for every row in: `audit_log`, `job_postings`, `jobseeker_drafts`, `jobseekers`, `news_posts`, `profiles`. Any `f` is a P0 finding.

> **Capture the script's output here when run against production.** Do not paste real names or real photo paths — this section accepts only `Smoke …` synthetic markers and counts.

---

## Prioritized remediation list

### P0 — must ship before launch

- **F11** Public-readiness gaps: ship `app/robots.ts`, `app/sitemap.ts`, per-page metadata, `app/(public)/error.tsx`. *(Step 3c.)*
- **F13 / F14** No runbook + no rollback plan: ship `docs/runbook.md` covering deploy, rollback, logs, incident response. *(Step 8.)*
- **F17** Error pages must not leak stack traces: audit and patch the four error boundaries. *(Step 3c.)*
- **F8** Verify no `NEXT_PUBLIC_*` carries a secret; verify `SUPABASE_SERVICE_ROLE_KEY` is not referenced in `"use client"` files. *(Step 3a.)*
- **F1 / F2 / F3 / F4 / F6** Run the RLS smoke against production as a pre-cutover gate. Document the queries and expected results above. *(Step 2 & runbook.)*
- **F7 / F15** Document the Supabase Auth Site URL + Redirect URL contract in the runbook so the owner sets them before DNS cutover. *(Step 3d & runbook.)*
- **F9** Document the migration parity verification in the runbook. *(Step 6 & runbook.)*

### P1 — ship in this sweep, not strictly blocking

- **F5** Spot-audit Server Actions for missing `safeParse` at the top — if any are missing, add a Zod schema. *(Step 3.)*
- **F16** Robots.txt explicitly disallows admin / staff paths; sitemap is published-only. *(Step 3c.)*
- **F10** Image compression smoke: Playwright posts a 1×1 PNG end-to-end. *(Step 7.)*
- **lib/logger.ts** + replacing `console.error` in Server Actions with structured JSON. *(Step 4.)*

### Follow-up — does not block launch

- **F6.1** Tighten storage `public-media` MIME allowlist to drop `image/gif`. New migration; documented in the runbook for a post-launch deploy.
- **F12** Pooler URL audit if cold-start auth issues surface in production. Check the runbook's "common errors" entry first.
- **CSP** No Content-Security-Policy in this pass — explicitly out of scope per the project owner; CSP misconfiguration would break the public site under "light audit". Track as a post-launch hardening sprint.
