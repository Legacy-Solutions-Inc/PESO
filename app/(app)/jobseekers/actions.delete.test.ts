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

const ACTIONS_PATH = new URL("./actions.ts", import.meta.url);

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
      /\.rpc\(\s*["']delete_jobseeker_with_audit["']/.test(body),
      "must call rpc('delete_jobseeker_with_audit', ...)"
    );
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
      /\.rpc\(\s*["']bulk_delete_jobseekers_with_audit["']/.test(body),
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
  it("actions.ts does not pass PII field names into delete RPC params", async () => {
    const src = await readActions();
    const rpcMatch = src.match(
      /rpc\(\s*["']delete_jobseeker_with_audit["'][^)]*\)/
    );
    assert.ok(rpcMatch, "delete_jobseeker_with_audit rpc call must be present");
    const callSite = rpcMatch[0];
    const forbidden = [
      "actor_email",
      "surname",
      "first_name",
      "firstName",
      "email",
    ];
    for (const word of forbidden) {
      assert.ok(
        !callSite.includes(word),
        `RPC call site must not pass ${word} in params`
      );
    }
  });
});
