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

## Vercel (deploy & serverless)

- **API routes:** Keep serverless logic in `app/api/` (App Router) or `api/`; avoid mixing heavy server-side logic outside route handlers.
- **Runtime:** Prefer Edge Runtime (`export const runtime = 'edge'`) and Fluid Compute for latency-sensitive routes; use Node.js only when needed.
- **Bundle size:** Keep serverless functions lean; use dynamic imports for heavy deps; avoid large libraries in API routes.
- **Caching:** Set `Cache-Control` (e.g. `s-maxage`, `stale-while-revalidate`) on API responses for cacheable data; use `next/image` for images (Vercel CDN).
- **Env:** Use Vercel dashboard for env vars (Development, Preview, Production); never commit secrets.
- **Security:** Configure security headers in `next.config` (e.g. `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`).
- **Deploy:** Use preview deployments for PRs; use `vercel --prod` for explicit production deploys (e.g. CI/CD). For purely static sites, consider `output: 'export'`.

---

## Clean Code (JavaScript/TypeScript)

Follow [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript) (Robert C. Martin's _Clean Code_ adapted for JS/TS): aim for **readable, reusable, refactorable** code.

- **Variables:** Meaningful, pronounceable names; same vocabulary for same concept; searchable (named constants, no magic numbers); explanatory variables; no mental mapping (avoid single-letter names); default parameters over `||`.
- **Functions:** Few parameters (≤2 ideally; use object/destructuring); one thing per function; name describes behavior; one abstraction level; no duplication (DRY); no boolean flags as params; avoid side effects and mutating inputs; prefer functional style (map/reduce/filter); encapsulate conditionals; remove dead code.
- **Objects/classes:** Getters/setters when access or validation is needed; private members where appropriate; prefer ES6 classes; avoid runtime type-checking (rely on TypeScript).
- **General:** Polymorphism over big conditionals when it simplifies; don't over-optimize; SOLID; consistent formatting; comments for "why" not "what."

Full guide with good/bad examples: **https://github.com/ryanmcdermott/clean-code-javascript**

---

For full examples and good/bad patterns, see `.cursor/nextjsrules.mdc`, `.cursor/shadcnrules.mdc`, `.cursor/tailwindrules.mdc`, `.cursor/supabaserules.mdc`, `.cursor/vercelrules.mdc`, and [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript).
