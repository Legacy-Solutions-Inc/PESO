import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

/**
 * Source-level test that every registration Server Action awaits
 * requireActiveUser BEFORE touching Supabase. We cannot exercise the
 * actions end-to-end from Node — they import @/lib/supabase/server,
 * whose specifier does not resolve without Next's TS transform — so
 * this is a static wiring check that catches regressions where a
 * future edit removes or reorders the guard.
 */

const ACTIONS_PATH = new URL(
  "../../app/(app)/jobseekers/register/actions.ts",
  import.meta.url
);

describe("registration Server Action guards", () => {
  it("createJobseeker / saveDraft / loadDraft call requireActiveUser before any Supabase call", async () => {
    const src = await readFile(ACTIONS_PATH, "utf8");

    assert.ok(
      src.includes(`from "@/lib/auth/require-active-user"`),
      "actions.ts must import requireActiveUser"
    );

    for (const fn of ["createJobseeker", "saveDraft", "loadDraft"]) {
      const fnStart = src.indexOf(`export async function ${fn}`);
      assert.ok(fnStart >= 0, `${fn} is exported`);

      const nextFn = src.indexOf("export async function ", fnStart + 1);
      const fnEnd = nextFn >= 0 ? nextFn : src.length;
      const body = src.slice(fnStart, fnEnd);

      const guardIdx = body.indexOf("await requireActiveUser()");
      assert.ok(
        guardIdx >= 0,
        `${fn} must call requireActiveUser()`
      );

      const supabaseIdx = body.indexOf("await createClient()");
      if (supabaseIdx >= 0) {
        assert.ok(
          guardIdx < supabaseIdx,
          `${fn} must await requireActiveUser() BEFORE createClient()`
        );
      }
    }
  });

  it("createJobseeker uses auth.data.user.id/email, not unguarded user values", async () => {
    const src = await readFile(ACTIONS_PATH, "utf8");

    // Regression guard: the pre-fix version did
    //   const { data: { user } } = await supabase.auth.getUser();
    //   ... user_id: user.id, created_by: user.email
    // The patched version reads from auth.data.user instead.
    const createFnStart = src.indexOf("export async function createJobseeker");
    const nextFn = src.indexOf("export async function ", createFnStart + 1);
    const createBody = src.slice(
      createFnStart,
      nextFn >= 0 ? nextFn : src.length
    );

    assert.ok(
      createBody.includes("auth.data.user.id"),
      "createJobseeker should insert with auth.data.user.id"
    );
    assert.ok(
      createBody.includes("auth.data.user.email"),
      "createJobseeker should insert with auth.data.user.email"
    );
  });
});
