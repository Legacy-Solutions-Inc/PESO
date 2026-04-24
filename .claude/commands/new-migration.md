---
description: Scaffold a new Supabase migration following .cursor/supabaserules.mdc with RLS baked in from the first line.
argument-hint: <short_snake_name>
---

Create a new Supabase migration named `$ARGUMENTS`.

## Before you write the SQL

1. Read `.cursor/supabaserules.mdc` in full — every rule in it applies.
2. Read the relevant section of `docs/requirements.md` so the schema reflects the SRS (FR section, field list, data types).
3. Check `supabase/migrations/` for existing table and column names so you don't collide or reinvent.

## File to create

`supabase/migrations/<UTC_TIMESTAMP>_$ARGUMENTS.sql` — use `YYYYMMDDHHMMSS` (UTC) for the timestamp, matching the existing naming convention.

## SQL rules (non-negotiable)

- `snake_case` identifiers; plural table names.
- Lowercase keywords; explicit `AS` aliases; prefer CTEs over nested subqueries.
- PK: `id bigint generated always as identity primary key`.
- Index every foreign key.
- `COMMENT ON TABLE <table> IS '...'` for every new table.
- `ENABLE ROW LEVEL SECURITY` on every table that stores anything user-owned or PII.
- At least one `CREATE POLICY` per role that needs access (Admin / Encoder / Viewer).
- Default to `SECURITY INVOKER`. If you must use `SECURITY DEFINER`, set `SET search_path = ''` and fully qualify every name inside the function.
- No PII in comments; no real data in seed or INSERT statements.

## After writing

1. Print the full SQL in chat.
2. List each rule above and mark it **applied** or **N/A with reason**.
3. Ask the user to review before running `supabase db push` locally. `supabase db push` is ask-tier; do not run it without confirmation.
4. Do NOT run `supabase db reset`, `supabase db push --force`, or anything that targets `--linked`. Those are denied.
