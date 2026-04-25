# PESO Lambunao — Production Runbook

This runbook is the single source of truth for taking PESO Lambunao to production, keeping it healthy, and recovering from incidents. Every step here is reproducible by someone other than the original implementer.

> **Hard scope reminder:** Vercel-native logs only — no Sentry, PostHog, Datadog, or third-party SDKs. Light audit depth. Local migrations only; never push from a developer machine.

---

## 1. Pre-launch checklist

The owner ticks every box. Anything unchecked blocks DNS cutover.

### 1.1 Code & build

- [ ] `npm run lint` is green on `main`.
- [ ] `npm run build` is green on `main`.
- [ ] `npm test` is green on `main`.
- [ ] `npx playwright test` is green against a local dev server with the synthetic users seeded.
- [ ] `git ls-files | grep -i "\.env"` returns nothing.
- [ ] No `NEXT_PUBLIC_*` variable carries a secret. Allowed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.

### 1.2 Supabase production project

- [ ] Migration parity: every file under `supabase/migrations/` is applied to production.
  - Verify with: `supabase migration list --db-url "$PROD_DB_URL"` and compare against the directory listing.
  - Filename order (oldest first):
    - `20250207000000_create_profiles.sql`
    - `20260207165420_create_jobseekers_tables.sql`
    - `20260207180000_add_user_status.sql`
    - `20260207180100_fix_existing_admin_status.sql`
    - `20260207181000_dashboard_stats_function.sql`
    - `20260207182000_add_profiles_email.sql`
    - `20260301000000_protect_profile_columns.sql`
    - `20260301000100_tighten_jobseekers_rls.sql`
    - `20260301000200_jobseekers_updated_by.sql`
    - `20260425000000_create_audit_log.sql`
    - `20260425010000_create_news_and_jobs.sql`
    - `20260425020000_set_public_media_mime_allowlist.sql`
- [ ] RLS smoke (Step 2 of pre-mortem) passes against production. Run `npm run rls-smoke` with `SUPABASE_URL=<prod-url>` and `SUPABASE_ANON_KEY=<prod-anon-key>` exported. Optionally export `SUPABASE_SERVICE_ROLE_KEY` to enable seed-dependent S1/S2.
- [ ] In Studio SQL editor, the manual checks below all pass:
  - `select tablename, rowsecurity from pg_tables where schemaname='public';` — every row shows `rowsecurity = t`.
  - `select policyname, cmd from pg_policies where schemaname='public' and tablename='audit_log' order by cmd;` — exactly two rows: INSERT + SELECT (no UPDATE, no DELETE policies).
  - `select id, public, allowed_mime_types from storage.buckets where id='public-media';` — `public = true`, allowlist contains at minimum `[image/webp, image/jpeg, image/png]`.
- [ ] Backups: Supabase Dashboard → Database → Backups shows daily backups enabled. (Free plan = no daily backups → either upgrade to Pro before launch, or accept the gap and document a manual export schedule.)
- [ ] Database connection mode: `SUPABASE_URL` (or `DATABASE_URL`) points at the **pooler** (transaction mode) URL, not the direct connection. Pooler URLs end in `pooler.supabase.com`.
- [ ] Auth providers: email/password is enabled. Magic link / OAuth providers are disabled unless explicitly required.

### 1.3 Supabase Auth URL configuration

In Supabase Dashboard → Authentication → URL Configuration:

- [ ] `Site URL` = `https://<production-domain>` — exact, including https.
- [ ] `Redirect URLs` includes:
  - `https://<production-domain>/auth/callback`
  - `https://<production-domain>/reset-password`
- [ ] Email templates → `Reset Password` template uses `{{ .SiteURL }}` so links inherit the Site URL above.
- [ ] Send a test reset email to a synthetic admin address — the email lands and the link returns to the production domain.

### 1.4 Vercel project

- [ ] Production env vars are set under Project → Settings → Environment Variables → Production.
  Names (values are set in the Vercel UI, not in this repo):
  - `NEXT_PUBLIC_SUPABASE_URL` (public — Supabase project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public — anon JWT)
  - `NEXT_PUBLIC_SITE_URL` (public — `https://<production-domain>`)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only — service role JWT; never `NEXT_PUBLIC_`)
- [ ] Vercel project is linked to the GitHub repo and to the `main` branch as the production source.
- [ ] `vercel.json` build settings are honored (`framework: nextjs`, `buildCommand: npm run build`).
- [ ] First production deployment is green; `/api/health` returns 200 with a `version` matching the latest commit SHA.

### 1.5 Public-readiness

- [ ] `/` renders the public landing without errors.
- [ ] `/news` and `/jobs` return 200; only published-and-current rows visible.
- [ ] `/privacy` renders the full notice. Office address and DPO email TODOs in `app/(public)/privacy/page.tsx` are replaced with verified values.
- [ ] `/robots.txt` returns the expected disallows (`/dashboard`, `/admin`, `/jobseekers`, `/users`, `/notifications`, `/api`).
- [ ] `/sitemap.xml` returns `/`, `/news`, `/jobs`, `/privacy`, plus published news ids and active job ids.
- [ ] Footer of every public page links to `/privacy`.

### 1.6 DNS cutover

- [ ] DNS provider has a `CNAME` (or `A` record per Vercel docs) pointing the production domain at Vercel.
  - **TODO (owner):** record the actual domain here and the exact CNAME / A record values once chosen. Today these are placeholder.
- [ ] HTTPS certificate has been issued by Vercel for the production domain.
- [ ] First end-to-end smoke against the production domain passes (see § 5).

---

## 2. Production env var list

Names only. Values are set in the Vercel dashboard under Project → Settings → Environment Variables. Never commit values to this repo.

| Name | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **NEXT_PUBLIC_** (browser-visible) | Supabase project URL — required by both anon and authed clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **NEXT_PUBLIC_** (browser-visible) | Anon JWT; RLS is the real authorization boundary |
| `NEXT_PUBLIC_SITE_URL` | **NEXT_PUBLIC_** (browser-visible) | Production origin used by sitemap.ts, robots.ts, password-reset email links |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Elevated DB access for `auth.admin.listUsers()` and similar; never imported by `"use client"` files |

> **Verify**: `vercel env ls` lists these four exactly. Anything else under `NEXT_PUBLIC_*` is a P0 finding.

---

## 3. Vercel deploy procedure

1. Code change is reviewed and merged to `main`.
2. Vercel auto-builds and deploys the production environment.
3. Watch the deployment in Vercel Dashboard → Deployments. Wait for `Ready` status.
4. Hit `/api/health` on the production domain. Confirm `version` matches the commit SHA of the deployment.
5. Run the post-deploy smoke list in § 5.
6. If anything fails, follow § 7 rollback.

---

## 4. DNS cutover

> Replace `<production-domain>` with the actual domain once confirmed. Today this is a placeholder.

1. In Vercel Dashboard → Project → Settings → Domains, add `<production-domain>`. Vercel returns either a CNAME target or an A record IP.
2. At the DNS registrar, set the indicated record:
   - **Apex (`example.gov.ph`)**: `A` record → the Vercel-supplied IP (typically `76.76.21.21`).
   - **Subdomain (`peso.example.gov.ph`)**: `CNAME` → `cname.vercel-dns.com`.
3. Wait for propagation (5 min – 24 hr depending on TTL). Vercel auto-issues a Let's Encrypt certificate once it sees the record.
4. Once the domain shows `Valid Configuration` in Vercel and HTTPS works, repeat the post-deploy smoke list against the production domain.

---

## 5. Post-deploy smoke test list

Hit each in order. Anything failing rolls back via § 7.

1. `GET /api/health` → 200, body has `ok: true` and `version` matching the latest commit SHA.
2. `GET /robots.txt` → 200, contains the expected disallows.
3. `GET /sitemap.xml` → 200, lists `/`, `/news`, `/jobs`, `/privacy`.
4. `GET /` (anon) → renders, no console errors, no "Application error" overlay.
5. `GET /news` (anon) → renders, no draft titles visible.
6. `GET /jobs` (anon) → renders, no expired postings visible.
7. `GET /privacy` (anon) → renders the notice.
8. `POST /login` with the synthetic admin → redirects to `/dashboard`.
9. From `/jobseekers`, click into a record and back out → no console errors.
10. Run all four Playwright spec files: `npx playwright test` from the operator's workstation, against `PLAYWRIGHT_BASE_URL=https://<production-domain>` (with synthetic users + `E2E_SUPABASE_SERVICE_ROLE_KEY` set).

---

## 6. Where to find logs

Vercel Logs only — no third-party SDK is provisioned by design.

### 6.1 Vercel Dashboard

- Project → Logs → Production environment.
- Time-range filter (e.g. last 1 hour) plus a free-text search.
- Logs are structured JSON emitted by `lib/logger.ts`. Useful filters:
  - `"level":"error"` — error-only.
  - `"action":"deleteJobseeker"` — find every delete attempt across users.
  - `"code":"VALIDATION_ERROR"` — Zod failures by route.
  - `"action":"createJobseeker" "code":"RPC_ERROR"` — DB-side failures during registration.

### 6.2 Audit log (correlate user actions)

The `public.audit_log` table is the source of truth for "who did what to which jobseeker record". Vercel logs are for ops; audit_log is for compliance.

In Supabase Studio SQL editor (admin-role only):

```sql
-- Last 50 audit rows
select created_at, action, actor_email, entity_id, metadata
from public.audit_log
order by created_at desc
limit 50;

-- Every action by a specific actor in the last 7 days
select created_at, action, entity_id, metadata
from public.audit_log
where actor_id = '<user-uuid>'
  and created_at >= now() - interval '7 days'
order by created_at desc;

-- Bulk deletes (for incident review)
select created_at, actor_email, metadata
from public.audit_log
where action = 'BULK_DELETE_JOBSEEKERS'
order by created_at desc;
```

The audit_log RLS only allows admin profiles to SELECT, so any staff member running these queries must be on an admin profile.

---

## 7. Incident response

### 7.1 Rolling back a bad deployment

1. In Vercel Dashboard → Deployments, find the previous green deployment.
2. Click the `…` menu → `Promote to Production`.
3. Within ~30 seconds, the production domain is serving the previous build.
4. After rollback: open the bad deployment and capture the failing logs / commit SHA for post-mortem before re-deploying anything.

> Vercel rollback is zero-downtime and reversible. It does **not** roll back database migrations. If the bad deploy applied a migration in the same release (it shouldn't — migrations are out-of-band), see § 7.3.

### 7.2 Disabling a runaway feature

There is no centralized feature-flag service. To disable a feature quickly:

1. Set an env var like `FEATURE_NEWS_PUBLISHING=off` in Vercel → Production env.
2. Trigger a redeploy (Settings → Deploy Hooks → run, or just push an empty commit).
3. The application reads the env var at request time and gates the feature.

The first commit to introduce a new feature flag should also document the flag name and accepted values here.

### 7.3 Migration rollback

There are no `down.sql` files. Forward-only migration policy.

If a migration in production turns out to be wrong:

1. Author a compensating migration locally (e.g. `20260501XXXX_revert_<thing>.sql`).
2. Test it against a local Supabase stack (`supabase db push`).
3. Apply to production via the owner's normal migration process (`supabase db push --linked` against a project the owner is authorized to write to).
4. Never edit a migration that has already been applied to production — only add new ones forward.

### 7.4 Restoring from backup

1. In Supabase Dashboard → Database → Backups, identify the timestamp before the incident.
2. Click `Restore` and follow the prompts. Restoring overwrites the live DB; coordinate downtime announcement first.
3. After restore, run the RLS smoke (§ pre-launch checklist) to confirm policies survived the restore.

> **Pre-launch drill:** the owner should restore a recent backup into a throwaway project at least once before going live, just to know the procedure works.

---

## 8. Common errors and remediation

Mapped from the pre-mortem failure modes (`docs/pre-mortem-2026-04-25.md`).

| Symptom | Likely cause | Remediation |
|---|---|---|
| Public visitor sees a draft news post | RLS regression on `news_posts` (F1) | Re-run RLS smoke (S1). Check `select * from pg_policies where tablename='news_posts'` for the anon-visibility predicate. |
| Anon user sees expired job posting | RLS regression or stale CDN cache (F2) | Re-run S2. Hard-refresh; the public list page is dynamically rendered, so a stale CDN should not be possible — if it is, audit `revalidatePath` calls in `app/(app)/admin/jobs/actions.ts`. |
| Login emails / reset emails never arrive | Auth Site URL is wrong, or DNS for sending domain is misconfigured (F7, F15) | Verify Supabase Dashboard → Authentication → URL Configuration. Check the email provider's bounce log. |
| Production deploy returns "function … does not exist" | Migration parity drift (F9) | Run `supabase migration list --db-url "$PROD_DB_URL"` and compare to `supabase/migrations/`. Apply the missing migrations in order out-of-band. |
| `/api/health` returns 500 | Vercel build artifact problem; usually env-var or runtime mismatch | Roll back via § 7.1 immediately, then investigate. |
| Public visitor sees a stack trace on `/news` or `/jobs` | Error boundary leaking error.message instead of digest (F17) | Audit `app/(public)/error.tsx`, `app/(app)/error.tsx`, `app/(auth)/error.tsx` — they should render `error.digest` only. |
| Google indexes `/dashboard` or admin routes | robots.txt missing or wrong (F16) | Hit `/robots.txt` on the production domain; confirm it disallows admin paths. Submit a removal request via Google Search Console for any already-indexed admin URL. |
| Logs full of `RPC_ERROR` for `delete_jobseeker_with_audit` | Postgres permission issue, or `is_active_admin()` returning false unexpectedly | Open Supabase Studio → SQL editor → run `select public.is_active_admin()` while logged in as the offending admin. If false, verify the profile has `role='admin'` AND `status='active'`. |
| Photo upload fails with "MIME type not allowed" | Bucket allowlist regression (F6) | `select allowed_mime_types from storage.buckets where id='public-media'` — must include `image/jpeg`, `image/png`, `image/webp`. Re-apply migration `20260425020000_set_public_media_mime_allowlist.sql` if missing. |
| First request after idle returns "AuthApiError: Token refresh failed" | Cold-start exceeding Supabase Auth timeout (F12) | Confirm `SUPABASE_URL` is the pooler URL. If issue persists, raise the Vercel function memory or move to Edge Runtime for the affected route. |

---

## 9. Backup restore drill (pre-launch only)

Run once before launch, then never again unless the procedure changes.

1. In Supabase Dashboard → Create a new throwaway project (e.g. `peso-restore-drill`).
2. Trigger a backup of the production project (Database → Backups → On-demand backup).
3. In the throwaway project, restore from that backup snapshot.
4. Run `npm run rls-smoke` against the throwaway project URL + anon key.
5. Confirm no real PII is visible to the anon role (the restore preserves all RLS policies — a `pass` here is the goal).
6. Delete the throwaway project.
7. Update this section with the date the drill last ran successfully:
   - **Last drill:** _(owner fills in once)_

---

## 10. Follow-ups (post-launch hardening, not blocking)

Tracked here so they don't get lost. None of these block the initial launch.

- **CSP** — add a Content-Security-Policy header in a follow-up. CSP misconfiguration would break the public site under a light-audit launch.
- **F6.1** — tighten the storage `public-media` MIME allowlist to drop `image/gif`. New migration; manual deploy via § 7.3.
- **Console.error migration completion** — `lib/logger.ts` is in place and the highest-risk delete actions emit structured logs. The remaining `console.error` calls in `app/(app)/admin/news/actions.ts`, `app/(app)/admin/jobs/actions.ts`, `app/(app)/jobseekers/register/actions.ts`, and `app/(app)/jobseekers/actions.ts` (read paths, exports, dashboard stats) should be migrated for log uniformity, but they don't carry PII risk. Track in the backlog.
- **Live integration tests** — the existing `lib/auth/require-active-user.test.ts` documents that Node's `--test` cannot resolve Next's `@/` aliases; the project's testing convention is source-level static checks. A separate live-DB harness, gated on `E2E_SUPABASE_URL`, is a follow-up.
- **Sentry / alerting** — out of scope for launch. If on-call grows, evaluate a Vercel-native alert (Logs → Drains → custom webhook) before adopting a third-party SDK.
