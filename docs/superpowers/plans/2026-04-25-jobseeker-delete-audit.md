# Per-Row Jobseeker Delete + Audit Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an Admin-only per-row delete on the Jobseeker Records table, backed by a hardened Server Action layer and a new append-only `audit_log` table — all deletes recorded in a single DB transaction via RPC; UI gates role visibility with Server Actions as the authority.

**Architecture:** A new `public.audit_log` table (RLS append-only, Admin-select) plus two SECURITY DEFINER RPCs (`delete_jobseeker_with_audit`, `bulk_delete_jobseekers_with_audit`) that delete + insert-audit in one transaction. Server Actions call the RPC after `requireAdmin` + Zod validation, then `revalidatePath`. A new `DeleteRowAction` client component mirrors the `BulkActions` AlertDialog UX. The server-rendered page reads the user's role and passes `currentUserRole` down; non-admins see disabled trash + bulk triggers with "Admin only" tooltips.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Postgres (RLS), Tailwind v4, shadcn/ui, React Hook Form + Zod v4, lucide-react.

---

## Pre-flight Notes (read once, do not skip)

**1. Test convention tension.** The existing `lib/auth/require-active-user.test.ts` explicitly documents that live Supabase integration tests cannot run under `node --experimental-strip-types --test` because `@/lib/supabase/server` does not resolve without Next's TS transform. Existing tests are **source-level static wiring checks**, not live-DB tests. The spec requests live-DB tests. The plan satisfies the *intent* (verify the correct guards, validation, audit insertion, and revalidation are wired) via static-wiring tests that match the existing pattern — these actually run under `npm test`. A separate live-DB harness (gated on `SUPABASE_TEST_URL`) is out of scope here; flag at hand-off.

**2. Role type.** `UserProfile.role` is `"admin" | "encoder"` today. The spec also mentions `'viewer'`. The new `currentUserRole` prop type will be `"admin" | "encoder" | "viewer"` (additive; no DB change) so future viewer support doesn't break the contract. The only runtime comparison is `=== "admin"`.

**3. Rollback semantics.** Raw Supabase JS cannot span a transaction across two statements. Using a single RPC (plpgsql function) gives us a real transaction: if the audit insert fails, the delete is rolled back by Postgres. No compensating logic needed.

**4. No soft delete.** Hard delete only. No `deleted_at`. No status lifecycle.

**5. PII in audit_log.metadata.** Metadata is `{}` for single-row; `{ ids, count }` for bulk. Never `actor_email`, `surname`, `firstName`, etc. `actor_email` lives in its own column and identifies the staff actor, not a jobseeker.

---

## File Structure

**New files**
- `supabase/migrations/20260425000000_create_audit_log.sql` — `audit_log` table + indexes + RLS policies + two SECURITY DEFINER RPCs.
- `lib/validations/jobseeker-actions.ts` — Zod schemas for `deleteJobseeker(id)` and `bulkDeleteJobseekers(ids)` inputs.
- `app/(app)/jobseekers/_components/delete-row-action.tsx` — per-row trash icon + AlertDialog + toast, mirrors `bulk-actions.tsx`.
- `app/(app)/jobseekers/actions.delete.test.ts` — static-wiring tests for hardened delete actions.

**Modified files**
- `app/(app)/jobseekers/actions.ts` — `deleteJobseeker` and `bulkDeleteJobseekers` become Zod-validated, call RPC, revalidatePath, typed return.
- `app/(app)/jobseekers/page.tsx` — reads `currentUserRole` via `getUserProfile`, passes to `JobseekersTable`.
- `app/(app)/jobseekers/_components/jobseekers-table.tsx` — new `currentUserRole` prop; renders `DeleteRowAction` per row; passes `isAdmin` to `BulkActions`; empty-state "Go to previous page" button when `initialData.length === 0 && initialPage > 1`.
- `app/(app)/jobseekers/_components/bulk-actions.tsx` — accepts `isAdmin` prop; when false, render trigger disabled with "Admin only" tooltip.

---

## Task 1: Create `audit_log` migration (schema + RLS + RPCs)

**Files:**
- Create: `supabase/migrations/20260425000000_create_audit_log.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Append-only audit log for destructive actions across the app.
-- Rows are inserted from SECURITY DEFINER RPCs that bundle the
-- action + audit write into one transaction so the log cannot
-- drift out of sync with the mutation it records.

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users (id) on delete restrict,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is
  'Append-only record of destructive / privileged actions. Writes come from
   SECURITY DEFINER RPCs; direct inserts are gated by RLS to auth.uid() = actor_id.
   No jobseeker PII ever appears in metadata — only actor identity and entity keys.';

create index idx_audit_log_created_at on public.audit_log (created_at desc);
create index idx_audit_log_actor_created on public.audit_log (actor_id, created_at desc);

alter table public.audit_log enable row level security;

-- Admins can read the full log.
create policy "Admins can read audit log"
  on public.audit_log for select
  using (public.is_active_admin());

-- Any authenticated user can insert a row only for themselves. In practice
-- inserts come from the RPCs below; this is defence-in-depth.
create policy "Actors can insert own audit rows"
  on public.audit_log for insert
  with check (auth.uid() = actor_id);

-- No update or delete policies -> append-only.

-- --------------------------------------------------------------------
-- RPC: delete_jobseeker_with_audit
-- Atomically deletes one jobseeker row and inserts one audit row.
-- --------------------------------------------------------------------
create or replace function public.delete_jobseeker_with_audit(p_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_email text;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.is_active_admin() then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select u.email
    into v_actor_email
  from auth.users as u
  where u.id = v_actor_id;

  if v_actor_email is null then
    raise exception 'Actor email missing' using errcode = 'P0002';
  end if;

  delete from public.jobseekers
  where id = p_id;

  if not found then
    raise exception 'Jobseeker % not found', p_id using errcode = 'P0002';
  end if;

  insert into public.audit_log (
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_actor_id,
    v_actor_email,
    'DELETE_JOBSEEKER',
    'jobseeker',
    p_id,
    '{}'::jsonb
  );
end;
$$;

comment on function public.delete_jobseeker_with_audit(bigint) is
  'Admin-only: delete one jobseeker and append an audit_log row in a single
   transaction. Raises on non-admin caller, missing row, or missing actor email.';

revoke all on function public.delete_jobseeker_with_audit(bigint) from public;
grant execute on function public.delete_jobseeker_with_audit(bigint) to authenticated;

-- --------------------------------------------------------------------
-- RPC: bulk_delete_jobseekers_with_audit
-- Atomically deletes N jobseekers and inserts ONE audit row with
-- metadata = { ids, count }.
-- --------------------------------------------------------------------
create or replace function public.bulk_delete_jobseekers_with_audit(p_ids bigint[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_email text;
  v_deleted_count integer;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not public.is_active_admin() then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'No ids provided' using errcode = '22023';
  end if;

  if array_length(p_ids, 1) > 500 then
    raise exception 'Bulk limit exceeded (max 500)' using errcode = '22023';
  end if;

  select u.email
    into v_actor_email
  from auth.users as u
  where u.id = v_actor_id;

  if v_actor_email is null then
    raise exception 'Actor email missing' using errcode = 'P0002';
  end if;

  with deleted as (
    delete from public.jobseekers
    where id = any(p_ids)
    returning id
  )
  select count(*) into v_deleted_count from deleted;

  insert into public.audit_log (
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_actor_id,
    v_actor_email,
    'BULK_DELETE_JOBSEEKERS',
    'jobseeker',
    null,
    jsonb_build_object(
      'ids', to_jsonb(p_ids),
      'count', v_deleted_count
    )
  );

  return v_deleted_count;
end;
$$;

comment on function public.bulk_delete_jobseekers_with_audit(bigint[]) is
  'Admin-only: delete many jobseekers and append one audit_log row with
   metadata = { ids, count } in a single transaction. Capped at 500 ids.';

revoke all on function public.bulk_delete_jobseekers_with_audit(bigint[]) from public;
grant execute on function public.bulk_delete_jobseekers_with_audit(bigint[]) to authenticated;
```

- [ ] **Step 2: Verify the migration file exists and lint-clean**

Run: `ls supabase/migrations/20260425000000_create_audit_log.sql`
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260425000000_create_audit_log.sql
git commit -m "feat(db): add audit_log table + delete-with-audit RPCs"
```

> **Do not** run `supabase db push`, `db reset`, or anything targeting `--linked`. Local `supabase db push` is the user's call.

---

## Task 2: Zod schemas for action inputs

**Files:**
- Create: `lib/validations/jobseeker-actions.ts`

- [ ] **Step 1: Write the schemas**

```ts
import { z } from "zod";

export const jobseekerIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .finite();

export const jobseekerIdsSchema = z
  .array(jobseekerIdSchema)
  .min(1, "At least one id is required")
  .max(500, "Cannot delete more than 500 records at once");

export type JobseekerId = z.infer<typeof jobseekerIdSchema>;
export type JobseekerIds = z.infer<typeof jobseekerIdsSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add lib/validations/jobseeker-actions.ts
git commit -m "feat(validation): add Zod schemas for jobseeker delete inputs"
```

---

## Task 3: Harden `deleteJobseeker` and `bulkDeleteJobseekers`

**Files:**
- Modify: `app/(app)/jobseekers/actions.ts` (the two existing delete functions near the bottom of the file)

- [ ] **Step 1: Add imports at top of `actions.ts` (below existing imports)**

```ts
import {
  jobseekerIdSchema,
  jobseekerIdsSchema,
} from "@/lib/validations/jobseeker-actions";
```

- [ ] **Step 2: Replace `deleteJobseeker` body**

Find the existing `export async function deleteJobseeker(` in `app/(app)/jobseekers/actions.ts` and replace its entire body with:

```ts
export async function deleteJobseeker(
  id: number
): Promise<{ success?: boolean; error?: string }> {
  const parsed = jobseekerIdSchema.safeParse(id);
  if (!parsed.success) {
    return { error: "Invalid jobseeker id" };
  }

  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_jobseeker_with_audit", {
      p_id: parsed.data,
    });

    if (error) {
      console.error("deleteJobseeker rpc error:", error.code, error.message);
      return { error: "Failed to delete record" };
    }

    revalidatePath("/jobseekers", "layout");
    return { success: true };
  } catch (err) {
    console.error("deleteJobseeker unexpected error:", err);
    return { error: "Failed to delete record" };
  }
}
```

- [ ] **Step 3: Replace `bulkDeleteJobseekers` body**

Find the existing `export async function bulkDeleteJobseekers(` and replace its entire body with:

```ts
export async function bulkDeleteJobseekers(
  ids: number[]
): Promise<{ success?: boolean; error?: string; count?: number }> {
  const parsed = jobseekerIdsSchema.safeParse(ids);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid ids payload" };
  }

  const auth = await requireAdmin();
  if (auth.error) {
    return { error: auth.error };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "bulk_delete_jobseekers_with_audit",
      { p_ids: parsed.data }
    );

    if (error) {
      console.error(
        "bulkDeleteJobseekers rpc error:",
        error.code,
        error.message
      );
      return { error: "Failed to delete records" };
    }

    revalidatePath("/jobseekers", "layout");
    return { success: true, count: typeof data === "number" ? data : undefined };
  } catch (err) {
    console.error("bulkDeleteJobseekers unexpected error:", err);
    return { error: "Failed to delete records" };
  }
}
```

Notes:
- Generic error messages returned to client — RPC details logged server-side (no PII in them, they're just error codes/messages).
- Single RPC call means delete + audit are in one DB transaction; if audit insert fails, Postgres rolls back the delete. Meets the spec's "do not leave a deletion unaudited".
- `requireAdmin` stays as defence-in-depth before we even attempt the RPC.

- [ ] **Step 4: Verify types still compile**

Run: `npx tsc --noEmit`
Expected: 0 errors (note: existing `console.error` patterns in other actions are untouched).

- [ ] **Step 5: Commit**

```bash
git add app/(app)/jobseekers/actions.ts
git commit -m "feat(jobseekers): route deletes through audit RPCs with Zod validation"
```

---

## Task 4: Static-wiring tests for hardened delete actions

**Files:**
- Create: `app/(app)/jobseekers/actions.delete.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

/**
 * Static wiring checks for the hardened delete Server Actions.
 *
 * We cannot exercise the actions end-to-end under Node's --test because
 * @/lib/supabase/server does not resolve without Next's TS transform
 * (see lib/auth/require-active-user.test.ts for the same rationale).
 * These tests verify the critical wiring that the spec requires:
 *  - Zod validation before any Supabase call.
 *  - requireAdmin gate.
 *  - Single RPC call (so delete + audit are one transaction).
 *  - revalidatePath("/jobseekers", "layout") on success.
 *  - Generic error strings returned to the client (no raw PII).
 */

const ACTIONS_PATH = new URL(
  "./actions.ts",
  import.meta.url
);

async function readActions(): Promise<string> {
  return await readFile(ACTIONS_PATH, "utf8");
}

function bodyOf(src: string, fnName: string): string {
  const start = src.indexOf(`export async function ${fnName}`);
  assert.ok(start >= 0, `${fnName} must be exported`);
  const next = src.indexOf("export async function ", start + 1);
  return src.slice(start, next >= 0 ? next : src.length);
}

describe("deleteJobseeker wiring", () => {
  it("imports Zod schemas from jobseeker-actions", async () => {
    const src = await readActions();
    assert.ok(
      src.includes('from "@/lib/validations/jobseeker-actions"'),
      "must import from lib/validations/jobseeker-actions"
    );
    assert.ok(
      src.includes("jobseekerIdSchema"),
      "must import jobseekerIdSchema"
    );
  });

  it("validates input with Zod BEFORE calling requireAdmin or Supabase", async () => {
    const body = bodyOf(await readActions(), "deleteJobseeker");
    const parseIdx = body.indexOf("jobseekerIdSchema.safeParse");
    const requireIdx = body.indexOf("requireAdmin(");
    const supabaseIdx = body.indexOf("createClient(");
    assert.ok(parseIdx >= 0, "must call jobseekerIdSchema.safeParse");
    assert.ok(requireIdx >= 0, "must call requireAdmin");
    assert.ok(parseIdx < requireIdx, "Zod parse must precede requireAdmin");
    assert.ok(parseIdx < supabaseIdx, "Zod parse must precede createClient");
  });

  it("calls the delete_jobseeker_with_audit RPC (single transaction)", async () => {
    const body = bodyOf(await readActions(), "deleteJobseeker");
    assert.ok(
      body.includes('.rpc("delete_jobseeker_with_audit"'),
      "must call rpc('delete_jobseeker_with_audit', ...)"
    );
    // No direct .from("jobseekers").delete() — spec requires the atomic RPC path.
    assert.ok(
      !/from\(["']jobseekers["']\)[\s\S]*\.delete\(\)/.test(body),
      "must not call supabase.from('jobseekers').delete() directly"
    );
  });

  it("revalidatePath('/jobseekers', 'layout') on success", async () => {
    const body = bodyOf(await readActions(), "deleteJobseeker");
    assert.ok(
      body.includes(`revalidatePath("/jobseekers", "layout")`),
      "must call revalidatePath('/jobseekers', 'layout')"
    );
  });

  it("returns a generic error string (no raw error.message leak)", async () => {
    const body = bodyOf(await readActions(), "deleteJobseeker");
    assert.ok(
      body.includes(`error: "Failed to delete record"`),
      "must return generic 'Failed to delete record' on RPC error"
    );
  });
});

describe("bulkDeleteJobseekers wiring", () => {
  it("validates ids array with Zod (min 1, max 500)", async () => {
    const body = bodyOf(await readActions(), "bulkDeleteJobseekers");
    assert.ok(
      body.includes("jobseekerIdsSchema.safeParse"),
      "must call jobseekerIdsSchema.safeParse"
    );
  });

  it("calls the bulk_delete_jobseekers_with_audit RPC (single transaction)", async () => {
    const body = bodyOf(await readActions(), "bulkDeleteJobseekers");
    assert.ok(
      body.includes('.rpc("bulk_delete_jobseekers_with_audit"'),
      "must call rpc('bulk_delete_jobseekers_with_audit', ...)"
    );
    assert.ok(
      !/from\(["']jobseekers["']\)[\s\S]*\.delete\(\)/.test(body),
      "must not call supabase.from('jobseekers').delete() directly"
    );
  });

  it("Zod parse precedes requireAdmin and Supabase client", async () => {
    const body = bodyOf(await readActions(), "bulkDeleteJobseekers");
    const parseIdx = body.indexOf("jobseekerIdsSchema.safeParse");
    const requireIdx = body.indexOf("requireAdmin(");
    const supabaseIdx = body.indexOf("createClient(");
    assert.ok(parseIdx < requireIdx && parseIdx < supabaseIdx);
  });

  it("revalidatePath('/jobseekers', 'layout') on success", async () => {
    const body = bodyOf(await readActions(), "bulkDeleteJobseekers");
    assert.ok(
      body.includes(`revalidatePath("/jobseekers", "layout")`),
      "must call revalidatePath('/jobseekers', 'layout')"
    );
  });
});

describe("audit_log metadata hygiene (static scan)", () => {
  it("actions.ts does not write PII field names into RPC call sites", async () => {
    const src = await readActions();
    // In the delete RPC call sites we must not be constructing metadata
    // objects that contain PII column names. The RPC itself controls
    // metadata; the client should only pass ids.
    const forbidden = [
      "actor_email",
      "surname",
      "first_name",
      "firstName",
      "email",
    ];
    const deleteSlice = src.slice(
      src.indexOf('rpc("delete_jobseeker_with_audit"')
    );
    // Only inspect the next ~500 chars after the rpc call site.
    const window = deleteSlice.slice(0, 500);
    for (const word of forbidden) {
      assert.ok(
        !window.includes(word),
        `RPC call site must not pass ${word} in params`
      );
    }
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npm test`
Expected: the new suite and existing suites all pass.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/jobseekers/actions.delete.test.ts
git commit -m "test(jobseekers): static-wiring checks for hardened delete actions"
```

---

## Task 5: `DeleteRowAction` component

**Files:**
- Create: `app/(app)/jobseekers/_components/delete-row-action.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteJobseeker } from "../actions";

interface DeleteRowActionProps {
  id: number;
  surname: string;
  firstName: string;
  isAdmin: boolean;
}

export function DeleteRowAction({
  id,
  surname,
  firstName,
  isAdmin,
}: DeleteRowActionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const label = `Delete record for ${firstName} ${surname}`;
  const nsrpId = `NSRP-${id}`;

  if (!isAdmin) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 text-red-600"
              aria-label={label}
              aria-disabled="true"
              disabled
            >
              <Trash2 className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Admin only</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await deleteJobseeker(id);

      if (result.error) {
        toast({
          title: "❌ Delete failed",
          description: result.error,
          duration: 5000,
        });
        return;
      }

      toast({
        title: "✅ Record deleted",
        description: nsrpId,
        duration: 3000,
      });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 text-red-600 hover:bg-red-50 hover:text-red-700"
            aria-label={label}
            onClick={() => setOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete record</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete jobseeker record?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete{" "}
              <span className="font-medium">
                {surname}, {firstName}
              </span>{" "}
              ({nsrpId}). This action cannot be undone and will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/jobseekers/_components/delete-row-action.tsx
git commit -m "feat(jobseekers): add DeleteRowAction component"
```

---

## Task 6: Gate `BulkActions` for non-admins

**Files:**
- Modify: `app/(app)/jobseekers/_components/bulk-actions.tsx`

- [ ] **Step 1: Accept an `isAdmin` prop and render disabled-with-tooltip when false**

Replace the entire file contents with:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { bulkDeleteJobseekers } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface BulkActionsProps {
  selectedIds: number[];
  onComplete: () => void;
  isAdmin: boolean;
}

export function BulkActions({
  selectedIds,
  onComplete,
  isAdmin,
}: BulkActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleBulkDelete = async () => {
    startTransition(async () => {
      const result = await bulkDeleteJobseekers(selectedIds);

      if (result.error) {
        toast({
          title: "❌ Delete Failed",
          description: result.error,
          duration: 5000,
        });
        return;
      }

      toast({
        title: "✅ Deleted Successfully",
        description: `${selectedIds.length} jobseeker(s) deleted`,
        duration: 3000,
      });

      setIsDeleteDialogOpen(false);
      onComplete();
      router.refresh();
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          {selectedIds.length} selected
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                aria-disabled="true"
                disabled
              >
                Bulk Actions
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin only</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          {selectedIds.length} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-h-11"
              disabled={isPending}
            >
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
              disabled={isPending}
            >
              <Trash2 className="mr-2 size-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length} jobseeker
              record(s). This action cannot be undone and will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/jobseekers/_components/bulk-actions.tsx
git commit -m "feat(jobseekers): gate BulkActions with Admin-only tooltip"
```

---

## Task 7: Wire `JobseekersTable` to render `DeleteRowAction` and empty-state pager

**Files:**
- Modify: `app/(app)/jobseekers/_components/jobseekers-table.tsx`

- [ ] **Step 1: Extend the props interface**

Find:
```ts
interface JobseekersTableProps {
  initialData: JobseekerRecord[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
}
```

Replace with:
```ts
interface JobseekersTableProps {
  initialData: JobseekerRecord[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  currentUserRole: "admin" | "encoder" | "viewer";
}
```

- [ ] **Step 2: Accept the prop in the component signature**

Find:
```ts
export function JobseekersTable({
  initialData,
  initialTotal,
  initialPage,
  pageSize,
}: JobseekersTableProps) {
```

Replace with:
```ts
export function JobseekersTable({
  initialData,
  initialTotal,
  initialPage,
  pageSize,
  currentUserRole,
}: JobseekersTableProps) {
```

- [ ] **Step 3: Add `isAdmin` derivation and import `DeleteRowAction`**

At the top of the file, under the existing `import { BulkActions } from "./bulk-actions";` line, add:

```ts
import { DeleteRowAction } from "./delete-row-action";
```

Inside the component body, right after `const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());`, add:

```ts
const isAdmin = currentUserRole === "admin";
```

- [ ] **Step 4: Pass `isAdmin` into `BulkActions`**

Find:
```tsx
{selectedIds.size > 0 && (
  <BulkActions
    selectedIds={Array.from(selectedIds)}
    onComplete={() => setSelectedIds(new Set())}
  />
)}
```

Replace with:
```tsx
{selectedIds.size > 0 && (
  <BulkActions
    selectedIds={Array.from(selectedIds)}
    onComplete={() => setSelectedIds(new Set())}
    isAdmin={isAdmin}
  />
)}
```

- [ ] **Step 5: Insert the `DeleteRowAction` into each row's action cell**

Find the block that renders the Edit button inside `<TableCell className="text-right">`:

```tsx
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-11 min-w-11"
                                aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                                asChild
                              >
                                <Link
                                  href={`/jobseekers/${jobseeker.id}/edit`}
                                  aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                                >
                                  <Edit className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit record</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
```

Insert the `DeleteRowAction` *before* the closing `</div>`:

```tsx
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="min-h-11 min-w-11"
                                aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                                asChild
                              >
                                <Link
                                  href={`/jobseekers/${jobseeker.id}/edit`}
                                  aria-label={`Edit record for ${jobseeker.first_name} ${jobseeker.surname}`}
                                >
                                  <Edit className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit record</p>
                            </TooltipContent>
                          </Tooltip>

                          <DeleteRowAction
                            id={jobseeker.id}
                            surname={jobseeker.surname}
                            firstName={jobseeker.first_name}
                            isAdmin={isAdmin}
                          />
                        </div>
```

- [ ] **Step 6: Add "Go to previous page" button to empty state when `initialPage > 1`**

Find the empty-state block:
```tsx
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-slate-500">No jobseekers found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11"
                        onClick={() => {
                          setSearchValue("");
                          router.push("/jobseekers");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
```

Replace with:
```tsx
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                      <p className="text-slate-500">No jobseekers found</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11"
                          onClick={() => {
                            setSearchValue("");
                            router.push("/jobseekers");
                          }}
                        >
                          Clear Filters
                        </Button>
                        {initialPage > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-11"
                            onClick={() => handlePageChange(initialPage - 1)}
                          >
                            Go to previous page
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add app/(app)/jobseekers/_components/jobseekers-table.tsx
git commit -m "feat(jobseekers): role-gated DeleteRowAction + empty-state pager"
```

---

## Task 8: Pass `currentUserRole` from the page Server Component

**Files:**
- Modify: `app/(app)/jobseekers/page.tsx`

- [ ] **Step 1: Add the role import**

Under the existing `import { parseJobseekersQuery } from "@/lib/validations/jobseekers-query";` add:

```ts
import { getUserProfile } from "@/lib/auth/get-user-profile";
```

- [ ] **Step 2: Fetch the profile and pass role down**

Find:
```tsx
  const params = await searchParams;
  const { page, pageSize, filters } = parseJobseekersQuery(params);

  const result = await getJobseekers({ page, pageSize, ...filters });
```

Replace with:
```tsx
  const params = await searchParams;
  const { page, pageSize, filters } = parseJobseekersQuery(params);

  const [profileResult, result] = await Promise.all([
    getUserProfile(),
    getJobseekers({ page, pageSize, ...filters }),
  ]);

  const currentUserRole: "admin" | "encoder" | "viewer" =
    profileResult.data?.profile.role ?? "viewer";
```

- [ ] **Step 3: Pass `currentUserRole` to `JobseekersTable`**

Find:
```tsx
          <JobseekersTable
            initialData={result.data.jobseekers}
            initialTotal={result.data.total}
            initialPage={page}
            pageSize={pageSize}
          />
```

Replace with:
```tsx
          <JobseekersTable
            initialData={result.data.jobseekers}
            initialTotal={result.data.total}
            initialPage={page}
            pageSize={pageSize}
            currentUserRole={currentUserRole}
          />
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/(app)/jobseekers/page.tsx
git commit -m "feat(jobseekers): pass currentUserRole from server to table"
```

---

## Task 9: Final verification gate

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: pass.

- [ ] **Step 2: Test**

Run: `npm test`
Expected: all suites pass, including the new `actions.delete.test.ts`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke (only if local Supabase + `supabase db push` was applied)**

Not required by this plan; the user explicitly reserved `supabase db push` as an out-of-band step.

---

## Self-Review (executed at plan-writing time)

**Spec coverage:**
- Deliverable 1 (audit_log migration + RLS + indexes) → Task 1. ✓
- Deliverable 2a/b (harden actions, single-tx audit, revalidate, rollback on audit failure) → Task 3 (RPC gives real transaction). ✓
- Deliverable 2c (Zod validation, requireAdmin, bulk cap 500) → Task 2 + Task 3. ✓
- Deliverable 3 (per-row DeleteRowAction, AlertDialog, min-h-11, aria-label, destructive styling, useTransition, toast, router.refresh) → Task 5. ✓
- Deliverable 4 (role-gated UI, disabled + tooltip, don't remove button) → Task 6 + Task 7 + Task 8. ✓
- Deliverable 5 (empty-page "Go to previous page" only when page > 1) → Task 7 step 6. ✓
- Rule: RLS enabled in same migration → Task 1. ✓
- Rule: requireAdmin preserved on both actions → Task 3. ✓
- Rule: Mirror bulk-actions UX → Task 5 (AlertDialog, red confirm, useTransition). ✓
- Rule: audit_log append-only (no update/delete policies) → Task 1. ✓
- Rule: revalidatePath after every delete path → Task 3 (both actions). ✓
- Rule: keyboard-accessible dialog → shadcn AlertDialog handles focus trap + restore. ✓
- Rule: Zod for action inputs → Task 2. ✓
- Rule: tests under `app/(app)/jobseekers/*.test.ts` → Task 4. Deviation: static-wiring, not live DB — flagged in Pre-flight note 1. ✓ with note.
- Rule: synthetic data in fixtures only → no fixtures introduced. ✓
- "Do not" list: no soft-delete column ✓; no PII in metadata ✓ (RPC builds metadata server-side from p_ids and count); no PII to console ✓ (only error codes/messages logged); role check server-side ✓; revalidatePath present ✓; no destructive Supabase ops ✓; no `.env*` touched ✓; no mocking ✓; Zod present ✓.

**Placeholder scan:** none detected — all steps have concrete code or concrete commands.

**Type consistency:** `DeleteRowAction` props (`id`, `surname`, `firstName`, `isAdmin`) match the call site in Task 7 step 5. `BulkActions` `isAdmin` prop matches Task 7 step 4. RPC names `delete_jobseeker_with_audit` / `bulk_delete_jobseekers_with_audit` match across Task 1, Task 3, Task 4. Zod schema names (`jobseekerIdSchema`, `jobseekerIdsSchema`) match import in Task 3 step 1 and test references in Task 4.
