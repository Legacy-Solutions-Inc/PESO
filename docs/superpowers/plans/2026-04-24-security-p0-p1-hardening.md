# Security P0 / P1 Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every P0 and P1 finding from the prior security audit so the PESO app is safe to handle citizen PII in production.

**Architecture:** Defence-in-depth. RLS policies on `profiles` and `jobseekers` become the true authorization boundary (not the Server Action layer alone). Column-update protection on `profiles` is enforced by a BEFORE UPDATE trigger (`WITH CHECK` cannot restrict which columns change). Server Actions add `requireActiveUser` guards as a second layer and for business-logic gating. Public sign-up is disabled; accounts are admin-provisioned per SRS FR-UM-01.

**Tech Stack:** Supabase (Postgres + Auth + RLS), Next.js 16 App Router, TypeScript, Zod, Node `--experimental-strip-types` for tests.

---

## Context

The prior audit (referenced in conversation history) surfaced two P0 findings and five P1 findings:

- **P0-A — Profile self-escalation.** The `profiles` UPDATE policies (`supabase/migrations/20250207000000_create_profiles.sql:17-23`, `20260207180000_add_user_status.sql:47-60`) use only `USING (auth.uid() = user_id OR public.is_admin())` without a `WITH CHECK` or column restriction. Any authenticated encoder can issue `UPDATE profiles SET role = 'admin', status = 'active' WHERE user_id = auth.uid()` via the browser Supabase client. Full privilege escalation via free sign-up.
- **P0-B — Jobseekers RLS too permissive.** All four policies on `public.jobseekers` (`20260207165420_create_jobseekers_tables.sql:68-88`) use `auth.uid() is not null`. Any authenticated session — pending, inactive, or active — can SELECT / INSERT / UPDATE / DELETE any jobseeker record directly via the anon-key JS client, bypassing Server Action guards.
- **P1 — Registration Server Actions missing guards.** `createJobseeker`, `saveDraft`, `loadDraft` (`app/(app)/jobseekers/register/actions.ts`) check only `if (!user)`, not `profile.status = 'active'`. Pending users bypass the admin-approval gate.
- **P1 — No `updated_by` audit trail** on the `jobseekers` table. Schema captures `created_by` but nothing on edit (`migrations/20260207165420_...sql:8-14`). Violates SRS §4.2 audit-logging recommendation.
- **P1 — `updateUserProfile` accepts `Record<string, any>`** (`app/(app)/users/actions.ts:121-123`). Any future caller could mutate arbitrary profile columns.
- **P1 — ~200 lines of filter logic duplicated** between `getJobseekers` (`actions.ts:325-522`) and `exportJobseekersCSV` (`actions.ts:836-1023`). Schema drift causes the CSV export and table view to return different result sets.
- **P1 — Public `/sign-up` with no gating.** Combined with P0-A, anyone on the internet can sign up → self-escalate → dump PII. SRS FR-UM-01 states only admins shall create accounts.

This plan treats the seven findings as one workstream because the RLS + Server Action guards are complementary halves of the same control. Splitting them would leave a partial fix in production.

---

## File Structure

### Migrations to create (3)

- `supabase/migrations/20260301000000_protect_profile_columns.sql` — BEFORE UPDATE trigger on `profiles` that blocks non-admins from changing `role`, `status`, `updated_by`; includes helper `public.is_active_user()`. (P0-A)
- `supabase/migrations/20260301000100_tighten_jobseekers_rls.sql` — Replace existing permissive policies with active-user + admin-for-delete policies. (P0-B)
- `supabase/migrations/20260301000200_jobseekers_updated_by.sql` — Add `updated_by` column with trigger for auto-stamp. (P1)

### Files to modify (5)

- `app/(app)/jobseekers/register/actions.ts` — Add `requireActiveUser` guard to `createJobseeker`, `saveDraft`, `loadDraft`. (P1)
- `app/(app)/jobseekers/actions.ts` — Set `updated_by` in `updateJobseeker`; extract `applyJobseekerFilters` helper. (P1)
- `app/(app)/users/actions.ts` — Replace `Record<string, any>` in `updateUserProfile` with a Zod-validated `ProfilePatch` schema. (P1)
- `app/(auth)/sign-up/page.tsx` — Replace form with "contact your administrator" message. (P1)
- `app/(auth)/login/login-form.tsx` — Change the "Request one" link destination to the new sign-up info page.

### Files to create (3)

- `app/(app)/jobseekers/filter-query.ts` — Shared `applyJobseekerFilters(query, filters)` helper consumed by both list and CSV export paths. (P1)
- `lib/validations/user-profile-patch.ts` — Zod schema for admin-side profile updates.
- `app/(auth)/sign-up/actions.test.ts` — Asserts `signUp` returns "disabled" without calling Supabase.

### Test files (all new)

- `supabase/tests/profiles_rls.sql` — psql-runnable SQL that asserts self-escalation fails and admin-update succeeds.
- `supabase/tests/jobseekers_rls.sql` — psql-runnable SQL asserting pending users cannot R/W and delete is admin-only.
- `app/(app)/jobseekers/register/actions.test.ts` — Node `--experimental-strip-types` test for `requireActiveUser` enforcement. Uses dependency injection via module mocking.
- `app/(app)/jobseekers/filter-query.test.ts` — Node test for `applyJobseekerFilters` shape.
- `lib/validations/user-profile-patch.test.ts` — Node test for Zod schema.

### Package.json script update

`package.json:10` — Extend the `test` script so `npm test` runs every `*.test.ts` file, not just `hooks/use-toast.test.ts`. New script:

```json
"test": "node --experimental-strip-types --test \"hooks/**/*.test.ts\" \"lib/**/*.test.ts\" \"app/**/*.test.ts\""
```

Node 20.6+ supports `--test` with glob patterns. Do this in Task 0 so every subsequent task's tests run under `npm test`.

---

## Task 0: Expand `npm test` to cover all `*.test.ts` files

**Files:**
- Modify: `package.json:10`

- [ ] **Step 1: Update the test script**

Change `package.json:10` from:

```json
"test": "node --experimental-strip-types hooks/use-toast.test.ts"
```

to:

```json
"test": "node --experimental-strip-types --test \"hooks/**/*.test.ts\" \"lib/**/*.test.ts\" \"app/**/*.test.ts\""
```

- [ ] **Step 2: Run `npm test` to confirm existing tests still pass**

Run: `npm test`
Expected: All existing tests pass (`hooks/use-toast.test.ts`, `lib/auth/auth-logic.test.ts`, `lib/validations/jobseeker-registration.test.ts`, `app/(app)/jobseekers/csv-helpers.test.ts`, `app/(app)/jobseekers/search-utils.test.ts`, `app/(app)/users/actions.test.ts`, `app/(auth)/forgot-password/logic.test.ts`, `app/auth/callback/utils.test.ts`). If `search-utils.test.ts` fails with its known pre-existing parse error, fix that pre-existing error too — it blocks the rest of the suite.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "test: run all *.test.ts files via npm test"
```

---

## Task 1: P0-A — Trigger-based column protection on profiles

**Files:**
- Create: `supabase/migrations/20260301000000_protect_profile_columns.sql`
- Create: `supabase/tests/profiles_rls.sql`

The audit's recommended fix (column-scoped `WITH CHECK`) is not directly expressible in Postgres RLS. Postgres RLS policies govern row visibility, not column mutability. The correct mechanism is a BEFORE UPDATE trigger that raises when a non-admin changes protected columns.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260301000000_protect_profile_columns.sql`:

```sql
-- Protect privileged profile columns from self-modification.
-- Only users with role='admin' AND status='active' may change role, status,
-- or updated_by. Non-admins can still update their own full_name.

create or replace function public.is_active_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  return exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
end;
$$;

comment on function public.is_active_admin is
  'True when the calling user has role=admin and status=active. Use this inside
   triggers and policies that gate privileged actions.';

create or replace function public.is_active_user()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  return exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and status = 'active'
  );
end;
$$;

comment on function public.is_active_user is
  'True when the calling user has an active profile (any role). Gates
   everyday mutations like creating jobseeker records.';

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_active_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Only admins can change role'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    raise exception 'Only admins can change status'
      using errcode = '42501';
  end if;

  if new.updated_by is distinct from old.updated_by then
    raise exception 'Only admins can set updated_by'
      using errcode = '42501';
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'user_id is immutable'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();
```

- [ ] **Step 2: Write the SQL assertion test**

Create `supabase/tests/profiles_rls.sql`:

```sql
-- Run against a branched / local Supabase instance. Each assertion aborts
-- the transaction on failure, so a successful run prints no errors.
--
-- Usage:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/profiles_rls.sql

begin;

-- Test 1: self-promotion to admin fails.
-- Simulate a pending encoder session by setting the JWT claim.
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000001';

do $$
declare
  v_raised boolean := false;
begin
  begin
    update public.profiles
    set role = 'admin'
    where user_id = '00000000-0000-0000-0000-000000000001';
  exception
    when insufficient_privilege then
      v_raised := true;
  end;
  if not v_raised then
    raise exception 'FAIL: non-admin self-promoted to admin';
  end if;
end;
$$;

-- Test 2: self-activation from pending fails.
do $$
declare
  v_raised boolean := false;
begin
  begin
    update public.profiles
    set status = 'active'
    where user_id = '00000000-0000-0000-0000-000000000001';
  exception
    when insufficient_privilege then
      v_raised := true;
  end;
  if not v_raised then
    raise exception 'FAIL: non-admin self-activated';
  end if;
end;
$$;

-- Test 3: non-admin may still edit their own full_name.
update public.profiles
set full_name = 'Test Encoder'
where user_id = '00000000-0000-0000-0000-000000000001';

rollback;
```

- [ ] **Step 3: Apply the migration on a Supabase branch and run the SQL test**

Run (requires Supabase CLI + Docker OR a project branch configured):

```bash
# Option A — local Docker
supabase start
supabase migration up
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2)" -f supabase/tests/profiles_rls.sql

# Option B — Supabase project branch (safer for verifying against real schema)
supabase branches create security-p0
# Apply the migration via mcp__supabase__apply_migration or supabase db push
```

Expected: SQL test prints no errors (each `FAIL` would have raised). Seed a test profile for user_id `00000000-...001` with `role='encoder' status='pending'` before running, or adjust the test UUID to match a real fixture.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260301000000_protect_profile_columns.sql supabase/tests/profiles_rls.sql
git commit -m "security(db): prevent non-admins from changing role/status (P0-A)"
```

---

## Task 2: P0-B — Tighten jobseekers RLS to active users; admin-only delete

**Files:**
- Create: `supabase/migrations/20260301000100_tighten_jobseekers_rls.sql`
- Create: `supabase/tests/jobseekers_rls.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260301000100_tighten_jobseekers_rls.sql`:

```sql
-- Replace the permissive 'auth.uid() is not null' policies on public.jobseekers
-- with policies gated on an active profile. Delete becomes admin-only.

-- Drop existing permissive policies
drop policy if exists "Authenticated users can read jobseekers" on public.jobseekers;
drop policy if exists "Authenticated users can insert jobseekers" on public.jobseekers;
drop policy if exists "Authenticated users can update jobseekers" on public.jobseekers;
drop policy if exists "Authenticated users can delete jobseekers" on public.jobseekers;

-- Recreate: active profile required for read/write
create policy "Active users can read jobseekers"
  on public.jobseekers for select
  using (public.is_active_user());

create policy "Active users can insert jobseekers"
  on public.jobseekers for insert
  with check (public.is_active_user());

create policy "Active users can update jobseekers"
  on public.jobseekers for update
  using (public.is_active_user())
  with check (public.is_active_user());

-- Delete restricted to admins (defence-in-depth; Server Actions also
-- call requireAdmin)
create policy "Admins can delete jobseekers"
  on public.jobseekers for delete
  using (public.is_active_admin());

-- Same tightening on the draft table: users who are no longer active should
-- not be able to stash PII drafts.
drop policy if exists "Users can read own draft" on public.jobseeker_drafts;
drop policy if exists "Users can insert own draft" on public.jobseeker_drafts;
drop policy if exists "Users can update own draft" on public.jobseeker_drafts;
drop policy if exists "Users can delete own draft" on public.jobseeker_drafts;

create policy "Active users read own draft"
  on public.jobseeker_drafts for select
  using (auth.uid() = user_id and public.is_active_user());

create policy "Active users insert own draft"
  on public.jobseeker_drafts for insert
  with check (auth.uid() = user_id and public.is_active_user());

create policy "Active users update own draft"
  on public.jobseeker_drafts for update
  using (auth.uid() = user_id and public.is_active_user())
  with check (auth.uid() = user_id and public.is_active_user());

create policy "Active users delete own draft"
  on public.jobseeker_drafts for delete
  using (auth.uid() = user_id and public.is_active_user());
```

- [ ] **Step 2: Write the RLS test**

Create `supabase/tests/jobseekers_rls.sql`:

```sql
-- Run against a branched / local Supabase after applying migrations.
-- Seeds two users: active-encoder and pending-encoder.
--
-- Usage:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/jobseekers_rls.sql

begin;

-- Fixture: seed profiles (use service role to bypass RLS for setup)
set local role postgres;
insert into public.profiles (user_id, role, status)
values
  ('00000000-0000-0000-0000-000000000002', 'encoder', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'encoder', 'pending')
on conflict (user_id) do update
  set role = excluded.role, status = excluded.status;

-- Test A: active encoder CAN insert jobseeker
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000002';

insert into public.jobseekers (
  user_id, created_by, personal_info, employment, job_preference, skills
)
values (
  '00000000-0000-0000-0000-000000000002',
  'active@example.test',
  '{"surname":"Test","firstName":"Active","sex":"MALE","civilStatus":"SINGLE","dateOfBirth":"1990-01-01"}'::jsonb,
  '{"status":"EMPLOYED"}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
);

-- Test B: pending encoder CANNOT select jobseekers
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000003';

do $$
declare v_count int;
begin
  select count(*) into v_count from public.jobseekers;
  if v_count > 0 then
    raise exception 'FAIL: pending user read jobseekers (% rows visible)', v_count;
  end if;
end;
$$;

-- Test C: pending encoder CANNOT insert
do $$
declare v_raised boolean := false;
begin
  begin
    insert into public.jobseekers (
      user_id, created_by, personal_info, employment, job_preference, skills
    )
    values (
      '00000000-0000-0000-0000-000000000003',
      'pending@example.test',
      '{"surname":"X","firstName":"X","sex":"MALE","civilStatus":"SINGLE","dateOfBirth":"1990-01-01"}'::jsonb,
      '{"status":"EMPLOYED"}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb
    );
  exception when others then
    v_raised := true;
  end;
  if not v_raised then
    raise exception 'FAIL: pending user inserted jobseeker';
  end if;
end;
$$;

-- Test D: non-admin active user CANNOT delete
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000002';

do $$
declare v_affected int;
begin
  delete from public.jobseekers where created_by = 'active@example.test';
  get diagnostics v_affected = row_count;
  if v_affected > 0 then
    raise exception 'FAIL: non-admin deleted jobseekers';
  end if;
end;
$$;

rollback;
```

- [ ] **Step 3: Apply migration and run the test**

Run:

```bash
supabase migration up
psql "$SUPABASE_DB_URL" -f supabase/tests/jobseekers_rls.sql
```

Expected: no `FAIL:` output. Any `FAIL:` means an assertion tripped.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260301000100_tighten_jobseekers_rls.sql supabase/tests/jobseekers_rls.sql
git commit -m "security(db): tighten jobseekers RLS to active users, admin-only delete (P0-B)"
```

---

## Task 3: P1 — Add `updated_by` audit column on jobseekers

**Files:**
- Create: `supabase/migrations/20260301000200_jobseekers_updated_by.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260301000200_jobseekers_updated_by.sql`:

```sql
-- Add updated_by audit column. Server Action will populate it on update.
-- Default empty string lets the column be NOT NULL without breaking INSERTs
-- that don't set it (created_by is the corresponding field for creation).

alter table public.jobseekers
  add column if not exists updated_by text not null default '';

comment on column public.jobseekers.updated_by is
  'Email of the user who last updated this row. Set by the updateJobseeker
   Server Action; not directly editable by end users.';
```

- [ ] **Step 2: Apply the migration**

```bash
supabase migration up
```

Expected: migration applies cleanly. Verify with:

```sql
select column_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'jobseekers'
  and column_name = 'updated_by';
```

Expected row: `updated_by | NO | ''::text`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260301000200_jobseekers_updated_by.sql
git commit -m "security(db): add jobseekers.updated_by audit column (P1)"
```

---

## Task 4: P1 — Add `requireActiveUser` to registration Server Actions

**Files:**
- Modify: `app/(app)/jobseekers/register/actions.ts`
- Create: `app/(app)/jobseekers/register/actions.test.ts`

- [ ] **Step 1: Write the failing test**

Create `app/(app)/jobseekers/register/actions.test.ts`:

```ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

// The test mocks the auth helpers by replacing require-active-user at the
// module-resolution layer. This needs the --experimental-strip-types runner
// plus --import data:text/javascript,... — we use a simpler approach: import
// the actions after setting globalThis.__PESO_TEST_AUTH_RESULT.
//
// See lib/auth/__test-harness.ts (created in this task) for the hook.

import { setAuthResult } from "@/lib/auth/__test-harness";

describe("createJobseeker / saveDraft / loadDraft active-user guard", () => {
  it("createJobseeker returns Unauthorized for pending users", async () => {
    setAuthResult({ data: null, error: "Account not active" });

    const { createJobseeker } = await import("./actions");
    const result = await createJobseeker({
      // Minimal valid payload; the guard should fire before schema parsing matters.
      personalInfo: {
        surname: "T",
        firstName: "T",
        sex: "MALE",
        civilStatus: "SINGLE",
        dateOfBirth: "1990-01-01",
        address: {},
        disability: {},
      },
      employment: { status: "EMPLOYED" },
      jobPreference: {},
      language: {},
      education: {},
      training: { entries: [] },
      eligibility: {},
      workExperience: { entries: [] },
      skills: { otherSkills: {}, certification: {}, pesoUseOnly: {} },
    } as never);

    assert.equal(result.error, "Account not active");
  });

  it("saveDraft returns Unauthorized for pending users", async () => {
    setAuthResult({ data: null, error: "Account not active" });

    const { saveDraft } = await import("./actions");
    const result = await saveDraft({}, 1, []);

    assert.equal(result.error, "Account not active");
  });

  it("loadDraft returns null for pending users", async () => {
    setAuthResult({ data: null, error: "Account not active" });

    const { loadDraft } = await import("./actions");
    const result = await loadDraft();

    assert.equal(result, null);
  });
});
```

- [ ] **Step 2: Create the test harness**

Create `lib/auth/__test-harness.ts`:

```ts
/**
 * Test-only injection point for auth results.
 * Production code reads from `getAuthResult()` via require-active-user.
 * Tests call `setAuthResult()` to simulate pending / inactive / admin.
 */

interface AuthResult {
  data: { user: { id: string; email: string }; profile: { role: string; status: string } } | null;
  error: string | null;
}

let injectedResult: AuthResult | null = null;

export function setAuthResult(result: AuthResult): void {
  injectedResult = result;
}

export function getInjectedResult(): AuthResult | null {
  return injectedResult;
}

export function clearInjectedResult(): void {
  injectedResult = null;
}
```

- [ ] **Step 3: Wire the harness into require-active-user**

Modify `lib/auth/require-active-user.ts`:

```ts
import { cache } from "react";
import { getUserProfile } from "./get-user-profile";
import { getInjectedResult } from "./__test-harness";

export const requireActiveUser = cache(async () => {
  const injected = getInjectedResult();
  if (injected) return injected;

  const { data, error } = await getUserProfile();

  if (error || !data) {
    return { data: null, error: error || "Not authenticated" };
  }

  if (data.profile.status !== "active") {
    return { data: null, error: "Account not active" };
  }

  if (data.profile.role !== "admin" && data.profile.role !== "encoder") {
    return { data: null, error: "Unauthorized: Invalid role" };
  }

  return { data, error: null };
});
```

- [ ] **Step 4: Run the test — it should FAIL**

Run: `npm test -- --test-name-pattern="active-user guard"`
Expected: 3 failures. `createJobseeker` currently does not call `requireActiveUser`, so it will either hit `supabase.auth.getUser()` (which is undefined in test env) and error, OR will proceed past the guard check. Message will differ from `"Account not active"`.

- [ ] **Step 5: Add the guard to createJobseeker**

In `app/(app)/jobseekers/register/actions.ts`, replace the body of `createJobseeker` (lines 26–98) with:

```ts
export async function createJobseeker(
  data: JobseekerRegistrationData
): Promise<ActionResult> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return { error: auth.error ?? "Not authenticated" };
  }

  const cleanedData = cleanFormData(data);
  const parseResult = jobseekerRegistrationSchema.safeParse(cleanedData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0];
    if (!firstError) {
      return { error: parseResult.error.message };
    }
    const fieldPath = firstError.path.join(" → ");
    return {
      error: `Validation Error: ${firstError.message}`,
      field: fieldPath,
      details: parseResult.error.issues.slice(0, 3).map((issue) => ({
        field: issue.path.join(" → "),
        message: issue.message,
      })),
    };
  }

  const validated = parseResult.data;

  try {
    const supabase = await createClient();

    const { data: jobseeker, error } = await supabase
      .from("jobseekers")
      .insert({
        user_id: auth.data.user.id,
        created_by: auth.data.user.email,
        personal_info: validated.personalInfo,
        employment: validated.employment,
        job_preference: validated.jobPreference,
        language: validated.language,
        education: validated.education,
        training: validated.training,
        eligibility: validated.eligibility,
        work_experience: validated.workExperience,
        skills: validated.skills,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.code, error.message);
      return { error: error.message };
    }

    await supabase
      .from("jobseeker_drafts")
      .delete()
      .eq("user_id", auth.data.user.id);

    revalidatePath("/jobseekers");
    return { success: true, id: jobseeker.id.toString() };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create jobseeker" };
  }
}
```

Add the import at the top of the file:

```ts
import { requireActiveUser } from "@/lib/auth/require-active-user";
```

- [ ] **Step 6: Add the guard to saveDraft and loadDraft**

Replace `saveDraft` (currently around lines 100–142) with:

```ts
export async function saveDraft(
  data: Partial<JobseekerRegistrationData>,
  currentStep: number,
  completedSteps: number[]
): Promise<ActionResult> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return { error: auth.error ?? "Not authenticated" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("jobseeker_drafts")
      .upsert(
        {
          user_id: auth.data.user.id,
          data: data,
          current_step: currentStep,
          completed_steps: completedSteps,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Draft save error:", error.code, error.message);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to save draft" };
  }
}
```

Replace `loadDraft` (around lines 144–179) with:

```ts
export async function loadDraft(): Promise<DraftData | null> {
  const auth = await requireActiveUser();
  if (auth.error || !auth.data) {
    return null;
  }

  try {
    const supabase = await createClient();

    const { data: draft, error } = await supabase
      .from("jobseeker_drafts")
      .select("data, current_step, completed_steps")
      .eq("user_id", auth.data.user.id)
      .single();

    if (error || !draft) {
      return null;
    }

    const parsed = draftPayloadSchema.safeParse(draft);
    if (!parsed.success) {
      return null;
    }

    return {
      data: parsed.data.data ?? {},
      currentStep: parsed.data.current_step,
      completedSteps: parsed.data.completed_steps,
    };
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}
```

- [ ] **Step 7: Run the test — it should PASS**

Run: `npm test -- --test-name-pattern="active-user guard"`
Expected: 3 passes. Clear injected auth between tests via `afterEach(clearInjectedResult)` — add `import { clearInjectedResult } from "@/lib/auth/__test-harness"; import { afterEach } from "node:test"; afterEach(() => clearInjectedResult());` if tests bleed state.

- [ ] **Step 8: Commit**

```bash
git add app/\(app\)/jobseekers/register/actions.ts app/\(app\)/jobseekers/register/actions.test.ts lib/auth/require-active-user.ts lib/auth/__test-harness.ts
git commit -m "security(actions): guard createJobseeker/saveDraft/loadDraft with requireActiveUser (P1)"
```

---

## Task 5: P1 — Set `updated_by` in `updateJobseeker`

**Files:**
- Modify: `app/(app)/jobseekers/actions.ts` (the `updateJobseeker` function, around lines 226–289)

This task depends on Task 3 (column must exist).

- [ ] **Step 1: Update `updateJobseeker`**

Replace the `updateJobseeker` body to include `updated_by`. The current update block (around lines 258–271) currently reads:

```ts
    const supabase = await createClient();
    const { error } = await supabase
      .from("jobseekers")
      .update({
        personal_info: validated.personalInfo,
        employment: validated.employment,
        job_preference: validated.jobPreference,
        language: validated.language,
        education: validated.education,
        training: validated.training,
        eligibility: validated.eligibility,
        work_experience: validated.workExperience,
        skills: validated.skills,
      })
      .eq("id", id);
```

Change to:

```ts
    const supabase = await createClient();
    const { error } = await supabase
      .from("jobseekers")
      .update({
        personal_info: validated.personalInfo,
        employment: validated.employment,
        job_preference: validated.jobPreference,
        language: validated.language,
        education: validated.education,
        training: validated.training,
        eligibility: validated.eligibility,
        work_experience: validated.workExperience,
        skills: validated.skills,
        updated_by: auth.data.user.email,
      })
      .eq("id", id);
```

The `auth.data.user.email` is already available because `updateJobseeker` calls `requireActiveUser()` at the top (`actions.ts:230`).

- [ ] **Step 2: Run full build + tsc**

Run: `npx tsc --noEmit && npm run build`
Expected: compiles. `updateJobseeker` now writes `updated_by`.

- [ ] **Step 3: Manual smoke**

Via a live dev session: edit a jobseeker, then `select id, updated_by from public.jobseekers where id = <that-id>;` — confirm the field matches the encoder's email.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/jobseekers/actions.ts
git commit -m "security(actions): stamp updated_by on jobseeker edit (P1)"
```

---

## Task 6: P1 — Extract `applyJobseekerFilters` helper (deduplicate)

**Files:**
- Create: `app/(app)/jobseekers/filter-query.ts`
- Create: `app/(app)/jobseekers/filter-query.test.ts`
- Modify: `app/(app)/jobseekers/actions.ts` (replace both filter blocks with helper call)

- [ ] **Step 1: Write the failing test**

Create `app/(app)/jobseekers/filter-query.test.ts`:

```ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import type { JobseekerFiltersInput } from "./filter-query";
import { applyJobseekerFilters } from "./filter-query";

/**
 * Minimal fake of the Supabase query builder to capture calls without a DB.
 */
class FakeQuery {
  calls: Array<{ method: string; args: unknown[] }> = [];
  eq(...args: unknown[]) { this.calls.push({ method: "eq", args }); return this; }
  ilike(...args: unknown[]) { this.calls.push({ method: "ilike", args }); return this; }
  or(...args: unknown[]) { this.calls.push({ method: "or", args }); return this; }
  lte(...args: unknown[]) { this.calls.push({ method: "lte", args }); return this; }
  gte(...args: unknown[]) { this.calls.push({ method: "gte", args }); return this; }
  not(...args: unknown[]) { this.calls.push({ method: "not", args }); return this; }
  is(...args: unknown[]) { this.calls.push({ method: "is", args }); return this; }
}

describe("applyJobseekerFilters", () => {
  it("applies sex as an eq filter", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q as never, { sex: "MALE" } as JobseekerFiltersInput);
    assert.deepEqual(q.calls, [{ method: "eq", args: ["sex", "MALE"] }]);
  });

  it("applies search as a sanitized or ilike", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q as never, { search: "Dela Cruz" } as JobseekerFiltersInput);
    assert.equal(q.calls.length, 1);
    assert.equal(q.calls[0].method, "or");
    const orString = String(q.calls[0].args[0]);
    assert.ok(orString.includes("surname.ilike.%Dela Cruz%"));
    assert.ok(orString.includes("first_name.ilike.%Dela Cruz%"));
  });

  it("converts ageMin to a dateOfBirth upper bound", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q as never, { ageMin: "18" } as JobseekerFiltersInput);
    assert.equal(q.calls.length, 1);
    assert.equal(q.calls[0].method, "lte");
    assert.equal(q.calls[0].args[0], "personal_info->>dateOfBirth");
  });

  it("ignores unrecognized skillType values", () => {
    const q = new FakeQuery();
    applyJobseekerFilters(q as never, { skillType: "not_a_real_skill" } as JobseekerFiltersInput);
    assert.equal(q.calls.length, 0);
  });
});
```

- [ ] **Step 2: Run the test — it should FAIL**

Run: `npm test -- --test-name-pattern="applyJobseekerFilters"`
Expected: cannot find module `./filter-query`.

- [ ] **Step 3: Create the helper**

Create `app/(app)/jobseekers/filter-query.ts`:

```ts
import type { JobseekerFilters } from "./actions";
import {
  sanitizeSearchQuery,
  escapeLikeWildcards,
} from "./search-utils";

export type JobseekerFiltersInput = Omit<JobseekerFilters, "page" | "pageSize" | "sortBy" | "sortOrder">;

/**
 * Minimal structural type for the subset of the Supabase query builder we call.
 * Returning `this` keeps chaining; `never` on the real builder would force
 * consumers to cast — this interface is intentionally narrow.
 */
export interface FilterableQuery {
  eq(column: string, value: unknown): this;
  ilike(column: string, pattern: string): this;
  or(filters: string): this;
  lte(column: string, value: unknown): this;
  gte(column: string, value: unknown): this;
  not(column: string, operator: string, value: unknown): this;
  is(column: string, value: unknown): this;
}

const LANGUAGE_PROFICIENCY_KEYS = ["read", "write", "speak", "understand"] as const;

const SKILL_OTHER_KEYS = [
  "auto_mechanic", "beautician", "carpentry_work", "computer_literate", "domestic_chores",
  "driver", "electrician", "embroidery", "gardening", "masonry", "painter_artist",
  "painting_jobs", "photography", "plumbing", "sewing_dresses", "stenography", "tailoring", "others",
] as const;

const REFERRAL_PROGRAM_KEYS = ["spes", "gip", "tupad", "jobstart", "dileep", "tesda_training"] as const;

function getDateYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

/**
 * Apply all user-supplied filters to a Supabase query builder. Used by both
 * the list (getJobseekers) and CSV export (exportJobseekersCSV) code paths
 * so behavior stays in sync.
 */
export function applyJobseekerFilters<Q extends FilterableQuery>(
  query: Q,
  filters: JobseekerFiltersInput
): Q {
  if (filters.search) {
    const sanitizedSearch = sanitizeSearchQuery(filters.search);
    if (sanitizedSearch) {
      query = query.or(
        `surname.ilike.%${sanitizedSearch}%,first_name.ilike.%${sanitizedSearch}%`
      );
    }
  }
  if (filters.surname) {
    query = query.ilike("surname", `%${escapeLikeWildcards(filters.surname)}%`);
  }
  if (filters.firstName) {
    query = query.ilike("first_name", `%${escapeLikeWildcards(filters.firstName)}%`);
  }
  if (filters.sex) query = query.eq("sex", filters.sex);
  if (filters.employmentStatus)
    query = query.eq("employment_status", filters.employmentStatus);
  if (filters.city)
    query = query.ilike("city", `%${escapeLikeWildcards(filters.city)}%`);
  if (filters.province)
    query = query.ilike("province", `%${escapeLikeWildcards(filters.province)}%`);
  if (filters.isOfw !== undefined && filters.isOfw !== "")
    query = query.eq("is_ofw", filters.isOfw === "true");
  if (filters.is4PsBeneficiary !== undefined && filters.is4PsBeneficiary !== "")
    query = query.eq("is_4ps_beneficiary", filters.is4PsBeneficiary === "true");

  if (filters.civilStatus) {
    query = query.eq("personal_info->>civilStatus", filters.civilStatus);
  }
  if (filters.barangay) {
    query = query.ilike(
      "personal_info->address->>barangay",
      `%${escapeLikeWildcards(filters.barangay)}%`
    );
  }
  if (filters.contactNumber) {
    query = query.ilike(
      "personal_info->>contactNumber",
      `%${escapeLikeWildcards(filters.contactNumber)}%`
    );
  }
  if (filters.email) {
    query = query.ilike(
      "personal_info->>email",
      `%${escapeLikeWildcards(filters.email)}%`
    );
  }
  if (filters.employedType) {
    query = query.eq("employment->>employedType", filters.employedType);
  }
  if (filters.unemployedReason) {
    query = query.eq("employment->>unemployedReason", filters.unemployedReason);
  }
  if (filters.ofwCountry) {
    query = query.ilike(
      "employment->>ofwCountry",
      `%${escapeLikeWildcards(filters.ofwCountry)}%`
    );
  }
  if (filters.employmentType) {
    query = query.eq("job_preference->>employmentType", filters.employmentType);
  }
  if (filters.localLocation) {
    const locVal = `%${escapeLikeWildcards(filters.localLocation)}%`;
    query = query.or(
      `job_preference->>localLocation1.ilike.${locVal},job_preference->>localLocation2.ilike.${locVal},job_preference->>localLocation3.ilike.${locVal}`
    );
  }
  if (filters.overseasLocation) {
    const locVal = `%${escapeLikeWildcards(filters.overseasLocation)}%`;
    query = query.or(
      `job_preference->>overseasLocation1.ilike.${locVal},job_preference->>overseasLocation2.ilike.${locVal},job_preference->>overseasLocation3.ilike.${locVal}`
    );
  }
  if (filters.occupation1) {
    query = query.ilike(
      "job_preference->>occupation1",
      `%${escapeLikeWildcards(filters.occupation1)}%`
    );
  }
  if (filters.tertiaryCourse) {
    query = query.ilike(
      "education->tertiary->>course",
      `%${escapeLikeWildcards(filters.tertiaryCourse)}%`
    );
  }
  if (
    filters.englishProficiency &&
    LANGUAGE_PROFICIENCY_KEYS.includes(
      filters.englishProficiency as (typeof LANGUAGE_PROFICIENCY_KEYS)[number]
    )
  ) {
    query = query.eq(`language->english->>${filters.englishProficiency}`, "true");
  }
  if (
    filters.filipinoProficiency &&
    LANGUAGE_PROFICIENCY_KEYS.includes(
      filters.filipinoProficiency as (typeof LANGUAGE_PROFICIENCY_KEYS)[number]
    )
  ) {
    query = query.eq(`language->filipino->>${filters.filipinoProficiency}`, "true");
  }
  if (filters.currentlyInSchool !== undefined && filters.currentlyInSchool !== "") {
    query = query.eq(
      "education->>currentlyInSchool",
      filters.currentlyInSchool === "true" ? "true" : "false"
    );
  }
  if (filters.educationLevel) {
    query = query.ilike(
      "education->tertiary->>levelReached",
      `%${escapeLikeWildcards(filters.educationLevel)}%`
    );
  }
  if (filters.seniorHighStrand) {
    query = query.ilike(
      "education->seniorHigh->>strand",
      `%${escapeLikeWildcards(filters.seniorHighStrand)}%`
    );
  }
  if (filters.graduateCourse) {
    query = query.ilike(
      "education->graduate->>course",
      `%${escapeLikeWildcards(filters.graduateCourse)}%`
    );
  }
  if (filters.trainingCourse) {
    query = query.ilike(
      "training->entries->0->>course",
      `%${escapeLikeWildcards(filters.trainingCourse)}%`
    );
  }
  if (filters.trainingInstitution) {
    query = query.ilike(
      "training->entries->0->>institution",
      `%${escapeLikeWildcards(filters.trainingInstitution)}%`
    );
  }
  if (filters.hasCertificates !== undefined && filters.hasCertificates !== "") {
    if (filters.hasCertificates === "true") {
      query = query.not("training->entries->0", "is", null);
    } else {
      query = query.is("training->entries->0", null);
    }
  }
  if (filters.civilServiceExam) {
    query = query.ilike(
      "eligibility->civilService->0->>name",
      `%${escapeLikeWildcards(filters.civilServiceExam)}%`
    );
  }
  if (filters.professionalLicense) {
    query = query.ilike(
      "eligibility->professionalLicense->0->>name",
      `%${escapeLikeWildcards(filters.professionalLicense)}%`
    );
  }
  if (filters.companyName) {
    query = query.ilike(
      "work_experience->entries->0->>companyName",
      `%${escapeLikeWildcards(filters.companyName)}%`
    );
  }
  if (filters.position) {
    query = query.ilike(
      "work_experience->entries->0->>position",
      `%${escapeLikeWildcards(filters.position)}%`
    );
  }
  if (filters.workEmploymentStatus) {
    query = query.eq(
      "work_experience->entries->0->>employmentStatus",
      filters.workEmploymentStatus
    );
  }
  if (
    filters.skillType &&
    SKILL_OTHER_KEYS.includes(filters.skillType as (typeof SKILL_OTHER_KEYS)[number])
  ) {
    query = query.eq(`skills->otherSkills->>${filters.skillType}`, "true");
  }
  if (filters.referralProgram) {
    const key = filters.referralProgram.toLowerCase();
    if (REFERRAL_PROGRAM_KEYS.includes(key as (typeof REFERRAL_PROGRAM_KEYS)[number])) {
      query = query.eq(`skills->pesoUseOnly->referralPrograms->>${key}`, "true");
    }
  }

  const ageMin = parseInt(String(filters.ageMin ?? ""), 10);
  const ageMax = parseInt(String(filters.ageMax ?? ""), 10);
  if (!Number.isNaN(ageMin) && ageMin >= 0) {
    query = query.lte("personal_info->>dateOfBirth", getDateYearsAgo(ageMin));
  }
  if (!Number.isNaN(ageMax) && ageMax >= 0) {
    query = query.gte("personal_info->>dateOfBirth", getDateYearsAgo(ageMax));
  }

  return query;
}
```

- [ ] **Step 4: Run the test — it should PASS**

Run: `npm test -- --test-name-pattern="applyJobseekerFilters"`
Expected: 4 passes.

- [ ] **Step 5: Replace the filter block in `getJobseekers`**

In `app/(app)/jobseekers/actions.ts`, locate the block starting around line 325 (`if (filters.search) {`) and ending before `// Sorting` (~line 524). Replace the entire block with:

```ts
    // Apply all filters via shared helper (kept in sync with exportJobseekersCSV)
    query = applyJobseekerFilters(query, filters);
```

Add the import at the top of the file:

```ts
import { applyJobseekerFilters } from "./filter-query";
```

- [ ] **Step 6: Replace the filter block in `exportJobseekersCSV`**

In the same file, locate the second filter block starting around line 836 (`if (filters.search) {`) inside the `while (hasMore)` loop, ending before `// Add deterministic sort and pagination` (~line 1024). Replace with:

```ts
        query = applyJobseekerFilters(query, filters);
```

- [ ] **Step 7: Verify build + records list + CSV export still work**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: all pass.
Manual: load `/jobseekers?sex=MALE` on the dev server and confirm results. Admin-trigger a CSV export and confirm the same filter produces the same set.

- [ ] **Step 8: Commit**

```bash
git add app/\(app\)/jobseekers/filter-query.ts app/\(app\)/jobseekers/filter-query.test.ts app/\(app\)/jobseekers/actions.ts
git commit -m "refactor(jobseekers): extract applyJobseekerFilters helper (P1)"
```

---

## Task 7: P1 — Replace `any` in `updateUserProfile` with Zod-validated patch

**Files:**
- Create: `lib/validations/user-profile-patch.ts`
- Create: `lib/validations/user-profile-patch.test.ts`
- Modify: `app/(app)/users/actions.ts` (the `updateUserProfile` helper, lines 121–156)

- [ ] **Step 1: Write the failing test**

Create `lib/validations/user-profile-patch.test.ts`:

```ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { userProfilePatchSchema } from "./user-profile-patch";

describe("userProfilePatchSchema", () => {
  it("accepts a role-only patch", () => {
    const r = userProfilePatchSchema.safeParse({ role: "admin" });
    assert.equal(r.success, true);
  });

  it("accepts a status-only patch", () => {
    const r = userProfilePatchSchema.safeParse({ status: "active" });
    assert.equal(r.success, true);
  });

  it("rejects unknown fields (strict mode)", () => {
    const r = userProfilePatchSchema.safeParse({ role: "admin", user_id: "x" });
    assert.equal(r.success, false);
  });

  it("rejects an invalid role value", () => {
    const r = userProfilePatchSchema.safeParse({ role: "superadmin" });
    assert.equal(r.success, false);
  });

  it("rejects an empty patch", () => {
    const r = userProfilePatchSchema.safeParse({});
    assert.equal(r.success, false);
  });
});
```

- [ ] **Step 2: Run the test — it should FAIL**

Run: `npm test -- --test-name-pattern="userProfilePatchSchema"`
Expected: module not found.

- [ ] **Step 3: Create the schema**

Create `lib/validations/user-profile-patch.ts`:

```ts
import { z } from "zod";

/**
 * Admin-side profile patch. Only fields an admin may modify via the Users
 * page are listed. Unknown fields are rejected (.strict) so a future caller
 * cannot mutate privileged columns like user_id by passing an untyped blob.
 */
export const userProfilePatchSchema = z
  .object({
    role: z.enum(["admin", "encoder"]).optional(),
    status: z.enum(["active", "pending", "inactive"]).optional(),
    full_name: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type UserProfilePatch = z.infer<typeof userProfilePatchSchema>;
```

- [ ] **Step 4: Run the test — it should PASS**

Run: `npm test -- --test-name-pattern="userProfilePatchSchema"`
Expected: 5 passes.

- [ ] **Step 5: Rewire `updateUserProfile`**

In `app/(app)/users/actions.ts`, replace the helper (currently around lines 121–156) with:

```ts
import { userProfilePatchSchema, type UserProfilePatch } from "@/lib/validations/user-profile-patch";

async function updateUserProfile(
  userId: string,
  updates: UserProfilePatch,
  errorMessage: string
) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error || !adminCheck.data) {
    return { success: false, error: adminCheck.error ?? "Unauthorized" };
  }

  const parsed = userProfilePatchSchema.safeParse(updates);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid update payload",
    };
  }

  try {
    const supabase = await createClient();
    const adminUserId = adminCheck.data.user.id;

    const { error } = await supabase
      .from("profiles")
      .update({
        ...parsed.data,
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/users");
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
    };
  }
}
```

The existing callers `updateUserRole(userId, newRole)` and `updateUserStatus(userId, newStatus)` already pass `{ role: newRole }` and `{ status: newStatus }` — those satisfy the schema. No caller changes needed.

- [ ] **Step 6: Verify build passes**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/validations/user-profile-patch.ts lib/validations/user-profile-patch.test.ts app/\(app\)/users/actions.ts
git commit -m "security(actions): zod-validate updateUserProfile payload (P1)"
```

---

## Task 8: P1 — Disable public `/sign-up` route

**Files:**
- Modify: `app/(auth)/sign-up/page.tsx` (replace form with static message)
- Modify: `app/(auth)/sign-up/actions.ts` (make `signUp` return an error without calling Supabase)
- Delete: `app/(auth)/sign-up/sign-up-form.tsx`
- Modify: `app/(auth)/login/login-form.tsx` (change "Request one" link)

- [ ] **Step 1: Replace the sign-up page with a static info surface**

Overwrite `app/(auth)/sign-up/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Request access – NSRP Jobseeker Registration",
  description: "How to get a PESO Lambunao staff account",
};

export default function SignUpPage() {
  return (
    <main className="w-full max-w-md px-6 py-12">
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          <Image
            alt="Municipality of Lambunao seal"
            src="/lambunao-seal.png"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
          <div className="h-12 w-px bg-border" aria-hidden />
          <Image
            alt="PESO Lambunao logo"
            src="/peso-logo.jpg"
            width={72}
            height={72}
            className="rounded-sm object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          PESO Lambunao
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          NSRP Jobseeker Registration System
        </p>
      </header>

      <section
        aria-labelledby="access-heading"
        className="rounded-lg border border-border bg-card p-8 shadow-sm"
      >
        <h2
          id="access-heading"
          className="text-xl font-medium tracking-tight text-foreground"
        >
          Requesting an account
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Accounts for this system are created by administrators. If you are PESO Lambunao staff, please contact your office administrator and provide your official government email address. An administrator will create the account and send you sign-in instructions.
        </p>
        <div className="mt-6">
          <Button asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Department of Labor and Employment &middot; National Skills Registration Program
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Replace the sign-up action**

Overwrite `app/(auth)/sign-up/actions.ts`:

```ts
"use server";

export type SignUpState = { error?: string };

/**
 * Public self-service sign-up is disabled per SRS FR-UM-01: user accounts
 * shall be created by administrators. This action exists only to return a
 * clear error if a client POSTs to the old form action.
 */
export async function signUp(
  _prevState: SignUpState | null,
  _formData: FormData
): Promise<SignUpState> {
  return {
    error:
      "Self-service sign-up is disabled. Please contact your administrator to request an account.",
  };
}
```

- [ ] **Step 3: Delete the now-orphaned form component**

```bash
git rm "app/(auth)/sign-up/sign-up-form.tsx"
```

- [ ] **Step 4: Update the login form's "Request one" link**

In `app/(auth)/login/login-form.tsx`, the "Need an account? Request one" link currently points at `/sign-up`. Leave the URL — `/sign-up` now shows the institutional message explaining the admin-provisioned flow. The text and link remain valid.

Verify no other reference to `sign-up-form` exists:

Run: `grep -rn "sign-up-form\|SignUpForm" app components lib 2>/dev/null`
Expected: only the deleted file should have referenced it.

- [ ] **Step 5: Build + sanity check**

Run: `npx tsc --noEmit && npm run build`
Expected: all 12 routes compile. `/sign-up` is now a static info page; the form and client-side state are gone.

Manual: open `http://localhost:3001/sign-up`. Confirm the new layout renders and the only action button is "Back to sign in".

- [ ] **Step 6: Commit**

```bash
git add "app/(auth)/sign-up/page.tsx" "app/(auth)/sign-up/actions.ts"
git commit -m "security(auth): disable public sign-up; accounts admin-provisioned (P1)"
```

---

## Verification Summary

After every task is committed, run the following end-to-end check:

1. `npm test` — all new and existing tests pass.
2. `npx tsc --noEmit` — no new type errors.
3. `npm run lint` — at or below the 19-problem baseline.
4. `npm run build` — all 12 routes compile.
5. Apply all three migrations on a Supabase branch:
   ```bash
   supabase branches create security-p0-p1
   supabase db push --linked --db-url "$BRANCH_DB_URL"
   ```
6. Run both SQL test files:
   ```bash
   psql "$BRANCH_DB_URL" -f supabase/tests/profiles_rls.sql
   psql "$BRANCH_DB_URL" -f supabase/tests/jobseekers_rls.sql
   ```
   Expected: neither prints any `FAIL:` line.
7. Manual attack walkthrough against the branch:
   - Sign up a fresh account via the Supabase dashboard (public sign-up route is disabled, so use the dashboard to seed a `pending` profile).
   - Using the Supabase JS client + the `pending` user's JWT, attempt:
     - `from("profiles").update({ role: "admin" }).eq("user_id", "…")` → must be rejected with `42501`.
     - `from("jobseekers").select("*")` → must return zero rows.
     - `from("jobseekers").insert({…})` → must be rejected.
8. Merge the Supabase branch only after the above is green.

## What is NOT in this plan

- **Admin-side invite flow.** Sending new-staff invitations via `supabase.auth.admin.inviteUserByEmail` is a product feature, not a security fix. Track as a follow-up ticket.
- **Rate limiting / captcha on `/login` and `/forgot-password`.** Recommended as defence-in-depth but not a P0/P1 item. Separate ticket.
- **UI-level PII leak fix (F-01).** Moving filter state out of URL query strings is a P0 from the same audit but tracked separately as a UI architecture change.
- **Migrating legacy drafts.** Any existing `jobseeker_drafts` rows owned by pending users will become inaccessible after Task 2's RLS tightening. If this matters, add a one-off cleanup migration that deletes such rows; otherwise leave them (they're orphaned but non-visible).
