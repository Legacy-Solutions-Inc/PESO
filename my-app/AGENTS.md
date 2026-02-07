# Agent guidelines – PESO my-app

Use this with the detailed rules in `.cursor/*.mdc`. Follow these conventions when editing or suggesting code.

---

## Requirements & product (source of truth)

**Base all feature design and implementation on `docs/requirements.md`.** That file is the Software Requirements Specification (SRS) and must be the single source of truth during development.

**Product:** PESO Lambunao – NSRP Jobseeker Registration & Management System (DOLE National Skills Registration Program). Internal web app for PESO staff only (no public/self-service in Phase 1).

**Scope:** (1) User management (Admin/Encoder/Viewer, login, RBAC, password reset). (2) Jobseeker registration – encode full NSRP form (personal info, employment status, job preference, language proficiency, education, training, eligibility, work experience, other skills, certification, PESO-only fields). (3) Dashboard & records – table view, search, filters (age, sex, address, employment, skills, education, job preference, OFW/4Ps), view/edit profiles. (4) Export – CSV (all or filtered), DOLE column consistency.

**Out of scope for Phase 1:** Public jobseeker registration, employer/job posting, SMS/email blasting.

**Constraints:** Fields must match official NSRP form; Philippine Data Privacy Act; support thousands of records; encoder-friendly form, keyboard nav, minimal scrolling; search &lt; 2s for 10k+ records; role-based access, password hashing, audit logging recommended.

When adding or changing features, check `docs/requirements.md` for the exact fields, FRs, and NFRs.

---

## Next.js

- **Structure:** `app/` with feature-based layout (e.g. `app/dashboard/page.tsx`, `layout.tsx`, `components/`, `hooks/` per feature). Shared code: `components/`, `lib/`, `hooks/`, `types/`, `public/`.
- **Components:** Prefer Server Components. Add `"use client"` only where needed and as low in the tree as possible. No `async` client components.
- **Data:** Fetch in Server Components; use Route Handlers (`route.ts`) for mutations/APIs. Use `loading.tsx`, Suspense, `error.tsx`, `not-found.tsx` for loading/errors/404.
- **Assets:** Use `next/image`, `next/font`, `next/dynamic` for heavy UI. Use `<Link>` for internal navigation (not raw `<a>`).
- **State:** Prefer local state; use Context or Zustand/Jotai for global state.

---

## shadcn/ui

- **Layout:** Domain components under `components/<domain>`, primitives under `components/ui`. One component per PascalCase file.
- **Components:** Functional components with `React.forwardRef` and `asChild` (e.g. Radix Slot). Use CVA + `cn` for variants and class merging.
- **Types:** Interfaces for props; Zod for form validation; avoid `any`.
- **Forms:** React Hook Form + Zod; early returns for invalid/loading.
- **Performance:** Lazy-load heavy UI; memoize when appropriate.
- **A11y:** Rely on shadcn/Radix; keep semantics. Don’t edit shadcn source; extend via `className`/`cn` or wrappers. Avoid `dangerouslySetInnerHTML` (or sanitize if required).

---

## Tailwind

- **Design system:** Define tokens in config (theme extend); avoid arbitrary values in markup when a token fits.
- **Components:** Encapsulate patterns in components (CVA/clsx). Avoid `@apply` except for narrow base/reset or legacy.
- **Class order:** Layout → Flexbox → Grid → Box → Typography → Backgrounds → Borders → Effects → Interactivity → States.
- **Responsive:** Mobile-first; use `sm:`, `md:`, etc. for larger breakpoints.
- **Config:** Set `content` so all files that use Tailwind classes are scanned.
- **Focus:** Prefer `outline-hidden` + custom focus (e.g. `focus:ring-*`) over `outline-none` for interactive elements. Use config + `dark:` for theming/dark mode.

---

## Supabase (when working on DB/backend)

- **SQL:** `snake_case`; lowercase keywords; plural tables; explicit `AS` aliases; prefer CTEs over nested subqueries.
- **Schema:** `id bigint generated always as identity primary key`; index every FK; `COMMENT ON TABLE` for tables.
- **Security:** Enable RLS on all relevant tables; default `SECURITY INVOKER`; if DEFINER, set `search_path = ''` and use fully qualified names.
- **Grants:** Table-level SELECT/DELETE; column-level INSERT/UPDATE where appropriate.
- **Performance:** Prefer `LANGUAGE sql` and correct volatility; use `supabase test db` and `supabase db lint`; consider type-safe query builders (e.g. Kysely) in Edge Functions.

---

For full examples and good/bad patterns, see `.cursor/nextjsrules.mdc`, `.cursor/shadcnrules.mdc`, `.cursor/tailwindrules.mdc`, and `.cursor/supabaserules.mdc`.
