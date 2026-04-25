# CLAUDE.md — PESO Lambunao

Internal web app for **PESO Lambunao** (DOLE Public Employment Service Office) that digitizes the NSRP Jobseeker Registration Form. Staff-only (Admin / Encoder / Viewer). Stores citizen PII under Supabase RLS.

## Source of truth

- `docs/requirements.md` is the SRS. Read the relevant section before designing or changing any feature. Never invent fields that aren't there.

## Conventions

Defer to these files — do not duplicate them here:

- `AGENTS.md` — cross-tool convention summary.
- `.cursor/nextjsrules.mdc` — Next.js App Router, Server Components, data fetching.
- `.cursor/shadcnrules.mdc` — component layout, CVA, RHF + Zod.
- `.cursor/tailwindrules.mdc` — design tokens, class order, responsive.
- `.cursor/supabaserules.mdc` — SQL style, schema, RLS, function volatility.
- `.cursor/vercelrules.mdc` — API routes, caching, security headers.
- `.cursor/rules/zod.mdc` — Zod 4 patterns.
- `.cursor/rules/clean-code.mdc` — clean code basics.
- `.cursor/rules/project-conventions.mdc` — one-line summary per stack.
- `.cursor/rules/requirements-baseline.mdc` — SRS-first rule.

## Responsive conventions

- `docs/responsive-conventions.md` — breakpoints, container, touch targets (44×44), input UX defaults (inputMode/autoComplete/autoCapitalize), table-card pattern, sidebar drawer, step-wizard pattern, reduced motion, test matrix. **Every UI change must comply.**
- `docs/responsive-audit-2026-04-25.md` — most recent P0–P3 audit per surface.

## Guard rails (re-read every session)

1. **Never paste real jobseeker PII** (names, birthdays, addresses, phone, email) into prompts, fixtures, or seed data. Use synthetic values.
2. **Never commit `.env*`. Never echo env values to chat or files.**
3. **Never run destructive Supabase ops against remote** (`db reset`, `db push --force`). Local DB only; production changes happen out-of-band.
4. **Every new table or PII-bearing column must have RLS enabled and at least one policy per affected role** (Admin / Encoder / Viewer) before merge.
5. **All forms use React Hook Form + Zod**; validation schemas live alongside the form. No unvalidated Server Action inputs.

## How to run

- `npm run dev` — local dev server.
- `npm run lint` — ESLint.
- `npm run build` — production build.
- `npm test` — runs `hooks/use-toast.test.ts` via Node's `--experimental-strip-types`.

## Claude Code extensions

- **Commands:** `/new-migration`, `/review-rls`, `/add-filter-field` (see `.claude/commands/`).
- **Subagents:** `@supabase-migration-reviewer` (read-only SQL audit), `@jobseeker-form-scaffolder` (NSRP sub-form scaffolder) (see `.claude/agents/`).
- **MCP:** Supabase read-only and Context7 docs enabled by default; Supabase write ops require confirmation.
