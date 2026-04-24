---
description: Add a new filter to the jobseeker records dashboard across Zod schema, UI control, server query, and CSV export.
argument-hint: <field_name> <type: enum|text|range>
---

Wire a new filter field through every layer of the jobseeker records dashboard.

Arguments: `$ARGUMENTS`. First token is the field name in `snake_case`; second token is the type (`enum`, `text`, or `range`).

## Before coding

1. Read the FR3 section of `docs/requirements.md` to confirm the field belongs to the NSRP filter set (age, sex, address, employment, skills, education, job preference, OFW, 4Ps). If it isn't listed, stop and ask the user before proceeding.
2. Read `.cursor/rules/zod.mdc` for schema patterns and `.cursor/shadcnrules.mdc` for the UI component style.
3. Inspect the existing filter wiring before editing — use these as the template:
   - `lib/validations/jobseekers-query.ts` (query schema).
   - `app/(app)/jobseekers/actions.ts` — the `getJobseekers` server action.
   - The filter UI component under `app/(app)/jobseekers/` (look for an `advanced-filter.tsx` or the closest equivalent).
   - The CSV helpers (look for `csv-helpers.ts`).

## Changes to make (in order)

1. **Zod schema.** Add the field to the filter schema in `lib/validations/jobseekers-query.ts`.
   - `enum`: `z.enum([...]).optional()`.
   - `text`: `z.string().trim().min(1).optional()`.
   - `range`: `z.tuple([z.coerce.number(), z.coerce.number()]).optional()`.
2. **Server query.** Extend `getJobseekers` in `app/(app)/jobseekers/actions.ts` so the filter applies to the Supabase query. If the field lives inside a JSONB column, use the JSONB path operator. If no generated column or index backs the path, flag that in your summary — do not create the migration in this command.
3. **UI.** Add the control to the advanced-filter component. Store the value in URL search params (not local state), matching the existing filters.
4. **CSV export.** Append the field to the export column list.

## After the edits

- Run `npx tsc --noEmit` (allow-listed) to confirm types pass.
- Print a summary listing each file touched and the line ranges edited.
- End with a **Not done** note for anything you deferred (index migration, tests, translations).
- Do NOT run `supabase db push` or any deploy-shaped command.
