#!/usr/bin/env node
/**
 * RLS smoke — runs the six anon-side checks documented in
 * docs/pre-mortem-2026-04-25.md against any Supabase project URL.
 *
 * Usage (from the repo root):
 *
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
 *     node --experimental-strip-types scripts/rls-smoke.ts
 *
 * Optional SUPABASE_SERVICE_ROLE_KEY enables the seed/teardown path that
 * inserts synthetic rows for S1 / S2. Without it the script still runs
 * S3 / S4 / S5 / S6 (read-only checks that need only the anon key) and
 * skips the seed-dependent ones.
 *
 * Synthetic data only — every fixture is captioned/titled with the
 * "Smoke <run-id>" prefix so cleanup is exact.
 */

import { createClient } from "@supabase/supabase-js";

interface CheckResult {
  id: string;
  description: string;
  status: "pass" | "fail" | "skip";
  detail?: string;
}

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON) {
  console.error(
    "Missing SUPABASE_URL and/or SUPABASE_ANON_KEY (or the NEXT_PUBLIC_* equivalents)."
  );
  process.exit(2);
}

const anon = createClient(URL, ANON, { auth: { persistSession: false } });
const admin = SERVICE
  ? createClient(URL, SERVICE, { auth: { persistSession: false } })
  : null;

const RUN_ID = `Smoke-${Date.now().toString(36)}`;
const results: CheckResult[] = [];

function record(r: CheckResult): void {
  results.push(r);
  const tag = r.status === "pass" ? "PASS" : r.status === "fail" ? "FAIL" : "SKIP";
  console.log(`[${tag}] ${r.id} — ${r.description}${r.detail ? ` :: ${r.detail}` : ""}`);
}

// ────────────────────────────────────────────────────────────────────────
// S3 — anon reads zero rows from jobseekers (read-only; no seeding)
// ────────────────────────────────────────────────────────────────────────
async function s3(): Promise<void> {
  const { data, error } = await anon.from("jobseekers").select("id").limit(5);
  if (error) {
    record({
      id: "S3",
      description: "anon select on jobseekers is denied / empty",
      status: "pass",
      detail: `error: ${error.code ?? error.message}`,
    });
    return;
  }
  record({
    id: "S3",
    description: "anon select on jobseekers is denied / empty",
    status: data?.length === 0 ? "pass" : "fail",
    detail: `rows: ${data?.length ?? 0}`,
  });
}

// ────────────────────────────────────────────────────────────────────────
// S4 — anon reads zero from audit_log; policy listing has no UPDATE/DELETE
// ────────────────────────────────────────────────────────────────────────
async function s4(): Promise<void> {
  const { data, error } = await anon.from("audit_log").select("id").limit(5);
  if (error) {
    record({
      id: "S4.anon-read",
      description: "anon select on audit_log is denied / empty",
      status: "pass",
      detail: `error: ${error.code ?? error.message}`,
    });
  } else {
    record({
      id: "S4.anon-read",
      description: "anon select on audit_log is denied / empty",
      status: data?.length === 0 ? "pass" : "fail",
      detail: `rows: ${data?.length ?? 0}`,
    });
  }

  // Policy listing requires direct catalog access (pg_policies). PostgREST
  // does not expose it by default; the operator runs the documented SQL
  // in the Supabase Studio editor and checks it manually. This block
  // emits a SKIP with the exact query so it shows up in the smoke output.
  record({
    id: "S4.policies",
    description: "audit_log has only INSERT + SELECT policies (append-only)",
    status: "skip",
    detail:
      "run in Studio: select cmd from pg_policies where schemaname='public' and tablename='audit_log' — expect only INSERT, SELECT",
  });
}

// ────────────────────────────────────────────────────────────────────────
// S5 — public-media bucket MIME allowlist
// ────────────────────────────────────────────────────────────────────────
async function s5(): Promise<void> {
  // Bucket config lives in the storage schema, which PostgREST does not
  // expose to the postgrest client by default. Document the SQL query
  // and skip — operator runs it in Studio and pastes the result into
  // the pre-mortem doc.
  record({
    id: "S5",
    description: "public-media bucket: public=true, allowlist⊇{jpeg,png,webp}",
    status: "skip",
    detail:
      "run in Studio: select id, public, allowed_mime_types from storage.buckets where id='public-media'",
  });
}

// ────────────────────────────────────────────────────────────────────────
// S6 — RLS enabled on every public table
// ────────────────────────────────────────────────────────────────────────
async function s6(): Promise<void> {
  // Same constraint as S4/S5 — pg_tables is not exposed to PostgREST.
  // Document the query for the operator to run in Studio.
  record({
    id: "S6",
    description: "RLS enabled on every public table",
    status: "skip",
    detail:
      "run in Studio: select tablename, rowsecurity from pg_tables where schemaname='public' — expect rowsecurity=t for every row",
  });
}

// ────────────────────────────────────────────────────────────────────────
// S1 + S2 — seed-dependent. Skipped without service role.
// ────────────────────────────────────────────────────────────────────────
async function s1s2(): Promise<void> {
  if (!admin) {
    record({
      id: "S1",
      description: "anon sees only currently-published news_posts",
      status: "skip",
      detail: "needs SUPABASE_SERVICE_ROLE_KEY for seeding",
    });
    record({
      id: "S2",
      description: "anon sees only active+not-expired job_postings",
      status: "skip",
      detail: "needs SUPABASE_SERVICE_ROLE_KEY for seeding",
    });
    return;
  }

  // Pick any existing user for FK requirements.
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1 });
  const authorId = users?.users[0]?.id;
  if (!authorId) {
    record({
      id: "S1",
      description: "anon sees only currently-published news_posts",
      status: "skip",
      detail: "no users in auth.users — cannot satisfy author_id FK",
    });
    record({
      id: "S2",
      description: "anon sees only active+not-expired job_postings",
      status: "skip",
      detail: "no users in auth.users — cannot satisfy created_by FK",
    });
    return;
  }

  const insertedNewsIds: number[] = [];
  const insertedJobIds: number[] = [];

  try {
    const { data: newsRows } = await admin
      .from("news_posts")
      .insert([
        {
          caption: `${RUN_ID} A — published`,
          status: "published",
          published_at: new Date(Date.now() - 60_000).toISOString(),
          author_id: authorId,
        },
        {
          caption: `${RUN_ID} B — draft`,
          status: "draft",
          author_id: authorId,
        },
        {
          caption: `${RUN_ID} C — archived`,
          status: "archived",
          published_at: new Date(Date.now() - 3_600_000).toISOString(),
          author_id: authorId,
        },
        {
          caption: `${RUN_ID} D — future`,
          status: "published",
          published_at: new Date(Date.now() + 3_600_000).toISOString(),
          author_id: authorId,
        },
      ])
      .select("id");
    for (const row of newsRows ?? []) insertedNewsIds.push(row.id);

    const future = new Date(Date.now() + 7 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const past = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const { data: jobRows } = await admin
      .from("job_postings")
      .insert([
        {
          title: `${RUN_ID} active`,
          employer_name: "Smoke Co",
          description: "Synthetic",
          location: "Test City",
          employment_type: "FULL_TIME",
          application_deadline: future,
          status: "active",
          posted_at: new Date().toISOString(),
          created_by: authorId,
        },
        {
          title: `${RUN_ID} draft`,
          employer_name: "Smoke Co",
          description: "Synthetic",
          location: "Test City",
          employment_type: "FULL_TIME",
          application_deadline: future,
          status: "draft",
          created_by: authorId,
        },
        {
          title: `${RUN_ID} expired`,
          employer_name: "Smoke Co",
          description: "Synthetic",
          location: "Test City",
          employment_type: "FULL_TIME",
          application_deadline: past,
          status: "active",
          posted_at: new Date().toISOString(),
          created_by: authorId,
        },
      ])
      .select("id");
    for (const row of jobRows ?? []) insertedJobIds.push(row.id);

    const { data: visibleNews } = await anon
      .from("news_posts")
      .select("caption")
      .like("caption", `${RUN_ID}%`);
    const newsCaptions = (visibleNews ?? []).map((r) => r.caption).sort();
    record({
      id: "S1",
      description: "anon sees only currently-published news_posts",
      status:
        newsCaptions.length === 1 && newsCaptions[0] === `${RUN_ID} A — published`
          ? "pass"
          : "fail",
      detail: `visible: ${JSON.stringify(newsCaptions)}`,
    });

    const { data: visibleJobs } = await anon
      .from("job_postings")
      .select("title")
      .like("title", `${RUN_ID}%`);
    const jobTitles = (visibleJobs ?? []).map((r) => r.title).sort();
    record({
      id: "S2",
      description: "anon sees only active+not-expired job_postings",
      status:
        jobTitles.length === 1 && jobTitles[0] === `${RUN_ID} active`
          ? "pass"
          : "fail",
      detail: `visible: ${JSON.stringify(jobTitles)}`,
    });
  } finally {
    if (insertedNewsIds.length > 0) {
      await admin.from("news_posts").delete().in("id", insertedNewsIds);
    }
    if (insertedJobIds.length > 0) {
      await admin.from("job_postings").delete().in("id", insertedJobIds);
    }
  }
}

async function main(): Promise<void> {
  console.log(`RLS smoke run-id: ${RUN_ID}`);
  console.log(`Target: ${URL}`);
  console.log(`Service role available: ${admin ? "yes" : "no (some checks skipped)"}\n`);

  await s1s2();
  await s3();
  await s4();
  await s5();
  await s6();

  const fails = results.filter((r) => r.status === "fail");
  console.log(
    `\nSummary — pass: ${results.filter((r) => r.status === "pass").length}` +
      `, fail: ${fails.length}` +
      `, skip: ${results.filter((r) => r.status === "skip").length}`
  );
  process.exit(fails.length === 0 ? 0 : 1);
}

void main();
