# PESO Lambunao — Responsive Audit (2026-04-25)

**Scope:** Every existing UI surface in the app, audited at 320 × 568 (iPhone SE 1st gen). Public pages (`app/(public)/*`) are out of scope here — they don't exist yet and will inherit the conventions doc.

**Severity legend:**
- **P0** — horizontal scroll, unreachable controls, or broken layout at 320px
- **P1** — poor UX at 320–639px (cramped, tap targets <44px, two-col grids that should single-col)
- **P2** — suboptimal but usable
- **P3** — polish

---

## Executive summary

| Dimension | Score | Key finding |
|---|---|---|
| Accessibility | 3 / 4 | Most inputs labeled; some icon buttons under 44×44; some dropdowns overflow viewport |
| Performance | 3 / 4 | No major layout-thrash; some long transitions ungated by `motion-safe:` |
| Theming | 4 / 4 | Token system in place; dark mode coherent |
| Responsive | 1 / 4 | Many `md:grid-cols-2` with no mobile single-col fallback; sidebar always visible at <lg; users + jobseekers tables need card pattern |
| Anti-patterns | 3 / 4 | Editorial direction is intentional; a few generic icon buttons remain |
| **Total** | **14 / 20** | Good — responsive dimension is the weakest by far |

**Most critical:** ~30 form/grid layouts force two-column at 320px (P0), the dashboard sidebar has no mobile drawer (P0), and the records table forces horizontal scroll (P0). These three patterns account for the majority of mobile failures.

---

## Findings by surface

### Dashboard shell — `components/dashboard/dashboard-shell.tsx`

| Severity | Issue | Fix |
|---|---|---|
| P0 | Sidebar always rendered at all viewports — no mobile drawer | Wrap sidebar in shadcn Sheet triggered by hamburger at `<lg` |
| P1 | Top bar `px-6` consumes ~12% of 320px viewport | Use `px-4 sm:px-6` |
| P1 | `bg-dashboard-surface p-6 lg:p-8` main padding too generous on phone | `p-4 sm:p-6 lg:p-8` |

### Records list — `app/(app)/jobseekers/_components/jobseekers-table.tsx`

| Severity | Issue | Fix |
|---|---|---|
| P0 | 8-column table with `overflow-x-auto` — entire table scrolls horizontally | Cards at `<sm`, hidden cols (Sex, Date Registered, ID subline) at `sm–md`, full table at `≥lg` |
| P1 | Search input, Filter button, Export, Bulk all on one row — wraps awkwardly at 320 | Search full-width at `<sm`, controls below in a wrapped row |
| P1 | Action buttons (View / Edit / Delete) in last cell — fine in cards but verify 44×44 in card form | Already `min-h-11 min-w-11` ✓ |
| P2 | Page-number buttons can wrap to 2 rows at 320 | Use compact "Page N of M" + Prev/Next at `<sm` |

### Advanced filter — `app/(app)/jobseekers/_components/advanced-filter.tsx`

| Severity | Issue | Fix |
|---|---|---|
| P0 | Dialog with `grid-cols-[11rem_1fr]` tab list at <sm forces horizontal scroll | Switch to a Sheet at `<sm` (full-height drawer); keep Dialog at `≥sm` |
| P1 | `max-h-[90vh]` only ~511px on iPhone SE — content cramped | Use `h-full sm:max-h-[85vh]` for the Sheet variant |
| P1 | Filter field grid `md:grid-cols-2` already collapses correctly | ✓ already mobile-first |

### Jobseeker profile — `app/(app)/jobseekers/[id]/_components/jobseeker-profile-view.tsx`

(Already partially adapted in this sweep.)

| Severity | Issue | Fix |
|---|---|---|
| P2 | Hero subtitle middle dots may wrap awkwardly between dot and value | Already joined as `"  ·  "` so wraps at spaces ✓ |
| P3 | Section trigger title may wrap below numeral on narrow screens | Already `flex-wrap` ✓ |

### Registration form — `components/jobseeker-registration/*`

| File | Severity | Issue | Fix |
|---|---|---|---|
| `form-layout.tsx` | P1 | Main content `p-6 lg:p-8` — no mobile-tighter padding | `p-4 sm:p-6 lg:p-8` |
| `form-layout.tsx` | P1 | `-mx-6 lg:-mx-8` reverse margins don't account for mobile padding | `sm:-mx-6 lg:-mx-8` |
| `progress-sidebar.tsx` | P0 | Sidebar visible at all sizes — no mobile equivalent | Hidden at `<lg`, replaced by sticky top stepper |
| `navigation-bar.tsx` | P0 | Inline Prev/Next inside content area — far from thumb on long forms | Sticky bottom at `<lg` with backdrop blur, full-width grid |
| `navigation-bar.tsx` | P1 | Save Draft button hidden at `<sm` removes feature | Move to overflow menu or show as smaller secondary |
| `step1-personal-info.tsx` | P0 | `md:grid-cols-2` at lines 50, 227, 362 forces two-col at 320 | `grid-cols-1 sm:grid-cols-2` |
| `step1-personal-info.tsx` | P1 | Sex/civil-status radio groups `flex gap-4` cramped at 320 | `flex-col sm:flex-row` |
| `step2-employment.tsx` | P0 | `md:grid-cols-2` at line 59 (employment status) | `grid-cols-1 sm:grid-cols-2` |
| `step2-employment.tsx` | P1 | OFW / Former OFW / 4Ps `flex gap-4` radio groups cramped | `flex-col sm:flex-row` (×3) |
| `step2-employment.tsx` | P1 | Self-employed checkbox list `pl-6` eats space | `sm:pl-6` |
| `step3-job-preference.tsx` | P0 | Employment-type radio `md:grid-cols-2` | `grid-cols-1 sm:grid-cols-2` |
| `step4-language.tsx` | P0 | Language skills grid `md:grid-cols-4` cramped | `grid-cols-2 sm:grid-cols-4` |
| `step4-language.tsx` | P2 | Language table forced horizontal scroll on mobile | Already wrapped in `overflow-x-auto`; OK ✓ |
| `step5-education.tsx` | P0 | Education tabs `grid-cols-4 lg:grid-cols-5` overlap text at 320 | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` |
| `step5-education.tsx` | P0 | All 5 sub-forms (`md:grid-cols-2`) force two-col at 320 | `grid-cols-1 sm:grid-cols-2` |
| `step5-education.tsx` | P1 | Curriculum-type radio `flex gap-6` wraps poorly | `flex-col sm:flex-row` |
| `step6-training.tsx` | P0 | Training entry `md:grid-cols-2` and Certificates `md:grid-cols-3` | Mobile-first fallbacks |
| `step7-eligibility.tsx` | P0 | Eligibility + license `md:grid-cols-2` | Mobile-first fallbacks |
| `step8-work-experience.tsx` | P0 | Two `md:grid-cols-2` rows + Employment status `md:grid-cols-4` | Mobile-first fallbacks |
| `step9-skills.tsx` | P0 | Other skills `md:grid-cols-3`, Signature/date `md:grid-cols-2`, Referral `md:grid-cols-3`, PESO `md:grid-cols-2` | Mobile-first fallbacks |
| All steps | P1 | Inputs missing mobile keyboard hints (`inputMode`, `autoComplete`, `autoCapitalize`, `spellCheck`) | Apply input UX defaults from conventions doc |

### Auth pages — `app/(auth)/*`

| File | Severity | Issue | Fix |
|---|---|---|---|
| `login-form.tsx` | P3 | `pr-12 size-11` password toggle button — adequate | ✓ |
| `login-form.tsx` | P1 | Email input has `type="email" autoComplete="email"` but missing `inputMode` and `autoCapitalize="none"` | Add the missing attrs |
| `sign-up-form.tsx` | P1 | Same missing inputMode / autoCapitalize on email; surname/firstName missing `autoComplete="given-name"`/`"family-name"` | Add |
| `forgot-password-form.tsx` | P1 | Email input missing `inputMode="email"` | Add |
| `reset-password-form.tsx` | P0 (none) | `autoComplete="new-password"` ✓; `minLength` ✓ | OK |
| All auth pages | P2 | `max-w-[440px]` form cards fine at 320 (responsive padding picks up) | OK |

### Users — `app/(app)/users/*`

| File | Severity | Issue | Fix |
|---|---|---|---|
| `users-table.tsx` | P0 | 4-column table forces horizontal scroll | Card-stack at `<sm`, full table at `≥sm` |
| `users-table.tsx` | P1 | Search `max-w-md` taller than viewport at 320; filter/action buttons wrap awkwardly | Full-width search at `<sm`; stack controls |
| `user-actions-menu.tsx` | P1 | Icon buttons `p-2` (~32px) — under 44 | `min-h-11 min-w-11` |
| `user-actions-menu.tsx` | P1 | Dialog without responsive treatment — overflows 320 | Use Sheet at `<sm` or constrain width |
| `pending/page.tsx` | P3 | `max-w-md` card fine at 320 with padding | OK |

### Dashboard home — `app/(app)/page.tsx`

(Read-once: stats grid + recent jobseekers list)

| Severity | Issue | Fix |
|---|---|---|
| P1 | Stats grid likely `md:grid-cols-3` or `md:grid-cols-4` — needs single-col at `<sm` | Verify and patch if so |
| P2 | Recent jobseekers list — already vertical | OK |

### Notifications — `components/dashboard/notification-bell.tsx`

| Severity | Issue | Fix |
|---|---|---|
| P1 | Dropdown content `w-64` (256px) overflows the 16px shell padding at 320 viewport | `w-[min(16rem,calc(100vw-2rem))]` or anchor with `align="end"` and clamp |

### Error / 404 pages

| File | Severity | Issue | Fix |
|---|---|---|---|
| `app/not-found.tsx` | P3 | `text-[clamp(5rem,14vw,9rem)]` fluid; rotation removed at <md ✓ | OK |
| `app/(app)/error.tsx` | P3 | `flex-col gap-3 sm:flex-row` responsive | OK |
| `app/(auth)/error.tsx` | P3 | Centered card | OK |

---

## Systemic patterns

1. **`md:grid-cols-N` without mobile fallback** — appears 25+ times across the registration form. Fix template: `grid-cols-1 sm:grid-cols-2` or `grid-cols-2 sm:grid-cols-N`.
2. **Radio group `flex gap-4` with no `flex-wrap` or stacking** — appears 6+ times. Fix template: `flex flex-col sm:flex-row sm:gap-4`.
3. **Dialogs that should be Sheets on mobile** — advanced filter and user actions menu. Fix: render Sheet at `<sm`, Dialog at `≥sm` (component switches based on `useMediaQuery` or two parallel mountings gated by Tailwind classes).
4. **Tables with overflow-x-auto** — jobseekers (8 cols) and users (4 cols). Fix: card pattern at `<sm`.
5. **Inputs missing mobile keyboard hints** — all auth forms and most registration inputs. Fix: apply the input UX defaults table from the conventions doc to every input.
6. **Sidebar with no mobile drawer** — dashboard shell + registration progress sidebar. Fix: shadcn Sheet at `<lg`, hamburger trigger.

## Positive findings

- Project already uses `min-h-11` on most buttons (PESO encoder accessibility was thoughtful).
- Tokens are in place — `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted` — and dark mode is coherent.
- Records-list page recently restyled to editorial — clean baseline.
- Form validation messaging is consistent and accessible.
- Auth password toggles already use `aria-label` and are 44×44.

## Recommended next commands (in order)

1. `/adapt` — apply mobile-first fallbacks to all `md:grid-cols-*` and radio groups
2. `/adapt` — add hamburger + Sheet drawer to dashboard shell
3. `/adapt` — record table → card pattern
4. `/adapt` — registration form sticky-top stepper + sticky-bottom nav
5. `/layout` — verify spacing rhythm at 320 / 360 / 768 after the structural moves
6. `/polish` — focus rings, active states, reduced motion, last-mile tightening
