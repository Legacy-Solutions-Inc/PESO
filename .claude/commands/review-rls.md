---
description: Audit Row Level Security coverage across Supabase migrations. Optionally focus on a single table.
argument-hint: [table_name]
---

Audit RLS posture on the PESO Lambunao database.

Argument: `$ARGUMENTS`. If non-empty, treat it as a single table name and audit only that table. If empty, audit every table defined in `supabase/migrations/*.sql`.

## Steps

1. `Glob` all files matching `supabase/migrations/*.sql`.
2. For each file, `Grep` for `create table` (case-insensitive). Extract every table name.
3. For each table found (or just the requested one):
   - Does a matching `enable row level security` statement exist anywhere in the migrations for this table?
   - How many `create policy` statements target this table? Group by operation (SELECT / INSERT / UPDATE / DELETE / ALL) and by role.
   - Are there any `security definer` functions that touch this table? If yes, do they set `search_path = ''`?
   - Is there any `grant ... to public` on this table or its columns? Flag every such grant.
4. Cross-check against the PESO role model from `docs/requirements.md`: Admin has full access, Encoder can INSERT/UPDATE, Viewer can SELECT only. Flag any table missing policies for a role the SRS says should access it.

## Output

Produce a markdown table:

| Table | RLS on? | SELECT / INSERT / UPDATE / DELETE policies | Flags |
| --- | --- | --- | --- |
| `jobseekers` | yes | 3 / 2 / 2 / 1 | — |

Followed by a **Findings** section that enumerates every flagged item with a one-line fix suggestion and a `file:line` citation into the migration SQL.

## Constraints

- Read-only. Do not edit any file.
- Do not execute SQL against any database. This is a static scan of migration files only.
- If multiple migrations mutate the same table, treat the combined state as the current schema.
