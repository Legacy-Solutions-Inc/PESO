import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

/**
 * Anon-side RLS smoke test for news_posts and job_postings.
 *
 * Skips cleanly when local Supabase env vars are not configured. Run
 * with a local stack via `supabase start` and re-run `npm test` to
 * exercise the real RLS policies in 20260425010000_create_news_and_jobs.sql.
 *
 * No auth is performed: we use only NEXT_PUBLIC_SUPABASE_URL +
 * NEXT_PUBLIC_SUPABASE_ANON_KEY, so the test runs as `anon` and asserts
 * that drafts, archived posts, and expired jobs are filtered out by RLS.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const liveStack =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  Boolean(SUPABASE_SERVICE_ROLE_KEY);

describe("anon RLS — news_posts + job_postings", { skip: !liveStack }, () => {
  if (!liveStack) {
    it("skipped — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to run", () => {
      // Marker test; the surrounding describe is already skipped.
    });
    return;
  }

  const anon = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  // We seed a small set of fixture rows under known marker captions so we
  // can scope our assertions and clean up afterwards without touching
  // anything else in the local DB. Service-role bypasses RLS for setup.
  const MARKER = `__rls_smoke_${Date.now()}`;
  let seededAuthorId: string | null = null;
  const insertedNewsIds: number[] = [];
  const insertedJobIds: number[] = [];

  before(async () => {
    // Find any existing user to be author / created_by; required by FK.
    const { data: usersList, error } = await admin.auth.admin.listUsers({
      perPage: 1,
    });
    if (error) throw error;
    seededAuthorId = usersList.users[0]?.id ?? null;
    if (!seededAuthorId) {
      // No users in local DB — skip the rest by creating one ephemeral user.
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email: `rls-smoke-${Date.now()}@example.test`,
          password: "smoke-temp-password",
          email_confirm: true,
        });
      if (createErr || !created.user) throw createErr ?? new Error("no user");
      seededAuthorId = created.user.id;
    }

    // News fixtures.
    const newsInserts = await admin
      .from("news_posts")
      .insert([
        {
          caption: `${MARKER}-published`,
          status: "published",
          published_at: new Date(Date.now() - 60_000).toISOString(),
          author_id: seededAuthorId,
        },
        {
          caption: `${MARKER}-draft`,
          status: "draft",
          author_id: seededAuthorId,
        },
        {
          caption: `${MARKER}-archived`,
          status: "archived",
          published_at: new Date(Date.now() - 3600_000).toISOString(),
          author_id: seededAuthorId,
        },
        {
          caption: `${MARKER}-future`,
          status: "published",
          published_at: new Date(Date.now() + 3600_000).toISOString(),
          author_id: seededAuthorId,
        },
      ])
      .select("id");
    if (newsInserts.error) throw newsInserts.error;
    insertedNewsIds.push(...(newsInserts.data ?? []).map((r) => r.id));

    const future = new Date(Date.now() + 7 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const past = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const jobInserts = await admin
      .from("job_postings")
      .insert([
        {
          title: `${MARKER} Active`,
          employer_name: "Smoke Test Co",
          description: "Test description",
          location: "Test City",
          employment_type: "FULL_TIME",
          application_deadline: future,
          status: "active",
          posted_at: new Date().toISOString(),
          created_by: seededAuthorId,
        },
        {
          title: `${MARKER} Draft`,
          employer_name: "Smoke Test Co",
          description: "Test description",
          location: "Test City",
          employment_type: "FULL_TIME",
          application_deadline: future,
          status: "draft",
          created_by: seededAuthorId,
        },
        {
          title: `${MARKER} Expired`,
          employer_name: "Smoke Test Co",
          description: "Test description",
          location: "Test City",
          employment_type: "FULL_TIME",
          application_deadline: past,
          status: "active",
          posted_at: new Date().toISOString(),
          created_by: seededAuthorId,
        },
      ])
      .select("id");
    if (jobInserts.error) throw jobInserts.error;
    insertedJobIds.push(...(jobInserts.data ?? []).map((r) => r.id));
  });

  after(async () => {
    if (insertedNewsIds.length > 0) {
      await admin.from("news_posts").delete().in("id", insertedNewsIds);
    }
    if (insertedJobIds.length > 0) {
      await admin.from("job_postings").delete().in("id", insertedJobIds);
    }
  });

  it("anon sees only published-and-current news, not drafts/archived/future", async () => {
    const { data, error } = await anon
      .from("news_posts")
      .select("id, caption, status")
      .like("caption", `${MARKER}-%`);
    assert.equal(error, null);
    const captions = (data ?? []).map((r) => r.caption);
    assert.deepEqual(captions.sort(), [`${MARKER}-published`]);
  });

  it("anon sees only active-and-not-expired jobs", async () => {
    const { data, error } = await anon
      .from("job_postings")
      .select("id, title, status")
      .like("title", `${MARKER} %`);
    assert.equal(error, null);
    const titles = (data ?? []).map((r) => r.title);
    assert.deepEqual(titles.sort(), [`${MARKER} Active`]);
  });

  it("admin (service role) sees all news fixtures", async () => {
    const { data, error } = await admin
      .from("news_posts")
      .select("id")
      .like("caption", `${MARKER}-%`);
    assert.equal(error, null);
    assert.equal(data?.length ?? 0, insertedNewsIds.length);
  });

  it("admin (service role) sees all job fixtures", async () => {
    const { data, error } = await admin
      .from("job_postings")
      .select("id")
      .like("title", `${MARKER} %`);
    assert.equal(error, null);
    assert.equal(data?.length ?? 0, insertedJobIds.length);
  });
});
