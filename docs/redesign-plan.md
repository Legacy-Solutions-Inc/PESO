# PESO Lambunao — UI/UX Redesign Plan

**Target aesthetic:** Government institutional
**Scope:** Full app, phased across 3 landable PRs
**Bundled a11y:** Yes (F-02, F-04, F-12 ship with the redesign)
**Brand:** No formal guide — tokens proposed below

---

## 1. Context

The prior audit scored PESO 11/20 (technical) and 19/40 (Nielsen). The app handles DOLE NSRP jobseeker PII and is used by PESO staff for 8-hour data-entry shifts, but its visual language is "consumer SaaS demo" — glassmorphism auth cards, blur-orb decorative backgrounds, a six-color rainbow dashboard grid, `animate-ping` "Live Data" indicator, colored button shadows. Not appropriate for a Philippine government employment office.

This redesign restates the app as what it actually is: an institutional data-entry tool for government staff, optimized for keyboard ergonomics, high contrast, and legibility on province workstations.

## 2. Goals

- **Encoder-first ergonomics.** Keyboard shortcuts for every primary action; focus moves correctly; loading states always visible; 8-hour-shift friendly contrast.
- **Institutional tone.** Visual vocabulary a DOLE/PESO staff member would recognize as official. Serif display typography, restrained palette, zero decorative effects.
- **WCAG 2.1 AA compliance** on encoder-critical surfaces. Screen-reader and keyboard-only users must be able to register a jobseeker end-to-end.
- **One design system.** All surfaces draw from the same token set. No more raw `bg-blue-600` / `bg-emerald-500` in components.

## 3. Non-goals (explicitly out of scope for this redesign)

- **F-01 (PII in URL query strings)** — architectural change; ships separately.
- **All security/RLS findings** from the prior audit — separate workstream.
- **Backend / Supabase migrations.**
- **CSV export column changes.**
- **Dark mode.** Current dark tokens stay functional but are not the design focus. Encoders run on daytime office lighting.
- **Public-facing marketing site.** This is internal only.

## 4. Design system (the single source of truth)

### 4.1 Color tokens (replaces `app/globals.css:53-126`)

Built on OKLCH for perceptually uniform scaling. Warm-leaning neutrals (tinted ~50° hue) to feel institutional rather than tech-cool.

```
Primary (institutional blue — darker, calmer than current #2070df):
  --color-primary:        oklch(0.38 0.12 258)   ≈ #1d4a8a
  --color-primary-hover:  oklch(0.34 0.12 258)   ≈ #183e75
  --color-primary-fg:     oklch(0.98 0.003 258)  ≈ #fafafa

Accent red (destructive + required-field marker only — never decorative):
  --color-destructive:    oklch(0.48 0.17 25)    ≈ #a33a2d
  --color-destructive-fg: oklch(0.98 0.003 25)

Status (semantic, used for employment/approval/OFW signals):
  --color-status-positive: oklch(0.52 0.11 155)  ≈ muted sage green
  --color-status-warning:  oklch(0.64 0.13 70)   ≈ muted amber
  --color-status-info:     oklch(0.50 0.10 235)  ≈ muted teal-blue

Surfaces (warm-tinted neutrals):
  --color-bg:            oklch(0.985 0.005 60)   ≈ #fafaf7 (warm off-white)
  --color-surface:       oklch(1 0 0)            ≈ #ffffff (cards)
  --color-surface-muted: oklch(0.96 0.005 60)    ≈ #f3f2ef
  --color-border:        oklch(0.89 0.008 60)    ≈ #dedcd7
  --color-border-strong: oklch(0.78 0.01 60)     ≈ #c0bdb6

Text:
  --color-fg:            oklch(0.22 0.015 60)    ≈ #2a2723 (warm near-black)
  --color-fg-muted:      oklch(0.50 0.012 60)    ≈ #77736d
  --color-fg-subtle:     oklch(0.62 0.010 60)    ≈ #949089
```

Removed tokens: `--dashboard-primary`, `--dashboard-primary-hover`, `--dashboard-surface` (collapsed into the set above). All chart/sidebar tokens re-mapped to the new palette.

### 4.2 Typography

**Display (h1, h2, hero):** `Source Serif 4` via `next/font/google`. Weight 500 and 600. Tight tracking (-0.02em). Serif choice: institutional gravitas, screens well at display sizes, free + Google Fonts hosted, wide-known. (Alternatives Fraunces/Instrument Serif considered and rejected — too editorial for gov tone.)

**Body:** keep `Geist Sans` (already installed, no migration). Weights 400 (body), 500 (labels), 600 (emphasis).

**Data:** keep `Geist Mono` for numerics. All numeric table cells get `font-variant-numeric: tabular-nums` so digits align vertically (critical for age, dates, counts columns on the records table).

Size scale (type scale of 1.2 — major third):
```
display-1: 3rem      (48px)   serif 500
display-2: 2.25rem   (36px)   serif 500
h1:        1.875rem  (30px)   serif 500
h2:        1.5rem    (24px)   serif 500
h3:        1.25rem   (20px)   sans 600
h4:        1.125rem  (18px)   sans 600
body:      1rem      (16px)   sans 400
small:     0.875rem  (14px)   sans 400
label:     0.75rem   (12px)   sans 500  letter-spacing: 0.04em
```

### 4.3 Spacing and rhythm

8px grid. Container max-width `1440px` (forms) / `1200px` (dashboards). Optical bottom-padding bias (+8px vs top) on sections.

### 4.4 Motion

- **Duration:** 150ms for state changes (hover/press), 220ms for layout shifts, 320ms for step transitions.
- **Easing:** `cubic-bezier(0.2, 0, 0, 1)` (standard material). No bounces, no springs.
- **Removed:** `animate-ping` (F-11), any auto-playing decorative animation.
- **Focus rings:** `outline: 2px solid var(--color-primary); outline-offset: 2px` — visible against all surfaces.

### 4.5 Anti-patterns stripped (explicit kill list)

| # | File:line | What goes |
|---|---|---|
| 1 | `app/(app)/layout.tsx:27-30` | Blur-orb decorative divs |
| 2 | `app/(auth)/layout.tsx:9-10` | Blur-orb decorative divs |
| 3 | `app/(auth)/{login,sign-up,forgot-password}/page.tsx` | `backdrop-blur-xl bg-white/70 ...` glass cards |
| 4 | `app/globals.css:128-133` | `.bg-pattern` radial gradient utility |
| 5 | `app/globals.css:136-149` | `.custom-scrollbar` (use system `scrollbar-color`) |
| 6 | `app/(app)/page.tsx:79-146` | 6-color gradient dashboard stat grid |
| 7 | `app/(app)/page.tsx:182-188` | `animate-ping` "Live Data" pulse |
| 8 | `app/(auth)/{login,sign-up,forgot-password}/*` | Raw `bg-blue-600 shadow-blue-500/30` buttons |
| 9 | `app/(app)/jobseekers/_components/jobseekers-table.tsx:344-347` | Raw `bg-emerald-500`/`bg-rose-500` status badges |
| 10 | Everywhere | Emoji in toasts (`✅`, `⚠️`) |
| 11 | `app/(app)/jobseekers/_components/jobseekers-table.tsx:184, 254`, `jobseekers/page.tsx:46` | `glass-panel` class usage |
| 12 | `app/(auth)/login/login-form.tsx:81-89` | Decorative "Remember me" checkbox (remove or wire it) |

---

## 5. Phase 1 — Foundation

**One PR. Branch: `redesign/phase-1-foundation`. Target ~300 LOC changed.**

### Files touched
- `app/globals.css` — full token replacement
- `app/layout.tsx` — swap fonts, add Source Serif
- `app/(app)/layout.tsx` — delete blur orbs
- `app/(auth)/layout.tsx` — delete blur orbs, new container
- `app/(auth)/login/page.tsx`, `sign-up/page.tsx`, `forgot-password/page.tsx` — new card, institutional typography
- `app/(auth)/login/login-form.tsx`, `sign-up/sign-up-form.tsx` — use `<Button>` instead of raw `bg-blue-600`
- `components/dashboard/dashboard-shell.tsx:181-186` — collapse duplicate h1 (fixes F-04)
- `components/ui/button.tsx` — verify variants map to new tokens (may be no change)
- `tailwind.config.ts` — mirror new tokens into `theme.extend.colors` for editor support

### Tasks (bite-sized)
1. Install `Source Serif 4` via `next/font/google`, wire `--font-serif` CSS var.
2. Replace entire `:root` token block in `globals.css` with the new OKLCH palette.
3. Replace `.dark` token block so dark mode keeps working (not the focus, but don't break it).
4. Delete `.bg-pattern` and `.custom-scrollbar` utilities.
5. Delete blur-orb divs from both layouts.
6. Rewrite login/sign-up/forgot-password pages: solid `bg-surface border border-border shadow-sm` card, serif h1, sentence-case h2, tokenized `<Button>` from `components/ui/button.tsx`. Delete "Remember me" (it's decorative — F-14) or wire to `auth.persistSession` (picking delete for smaller PR).
7. Collapse DashboardShell's two h1 elements to one responsive h1 with inner `<span>` sections.
8. Audit `components/ui/button.tsx` to confirm `variant="default"` renders the new primary color.

### Verification (Phase 1)
- `npx tsc --noEmit` passes.
- `npm run lint` — no new errors (pre-existing errors documented, not introduced).
- `npm run build` — all 12 routes compile.
- Manual: `http://localhost:3001/login` renders with serif h1, solid card, single `bg-primary` button, no blur orbs.
- Manual a11y: Tab through login — focus ring visible on every interactive element; only one `<h1>` in the DOM (verify with `document.querySelectorAll('h1')` in devtools).
- Contrast: body text over `--color-bg` ≥ 7:1 (AAA), primary button text over primary bg ≥ 4.5:1. Test using axe DevTools or Lighthouse.

---

## 6. Phase 2 — Encoder surfaces

**One PR. Branch: `redesign/phase-2-encoder`. Target ~600 LOC.**

### Files touched
- `app/(app)/page.tsx` — dashboard restructure
- `app/(app)/jobseekers/page.tsx` — remove `glass-panel`
- `app/(app)/jobseekers/_components/jobseekers-table.tsx` — token badges, loading overlay, honest placeholder
- `app/(app)/jobseekers/_components/advanced-filter.tsx` — loading state on Apply, keyboard close (Esc)
- `app/(app)/jobseekers/[id]/page.tsx` — layout polish
- `app/(app)/jobseekers/[id]/_components/jobseeker-profile-view.tsx` — token status badges
- `app/(app)/jobseekers/[id]/edit/page.tsx` — inherits wizard
- `components/jobseeker-registration/form-layout.tsx` — focus management, aria-live, keyboard shortcuts, autosave fix, no-localStorage-PII, no emoji
- `components/jobseeker-registration/progress-sidebar.tsx` — token colors
- `components/jobseeker-registration/step-renderer.tsx` — step container ref, heading tabindex
- `components/jobseeker-registration/steps/*.tsx` — add ref-able h2, remove badge emoji
- `lib/errors/user-facing.ts` (new) — error-code → friendly copy mapper
- `hooks/use-keyboard-shortcuts.ts` (new) — reusable shortcut hook

### Tasks
1. **Dashboard rewrite.** Collapse six-color card grid to one neutral card treatment (same surface, same border, same icon treatment). Lead with number + label. Drop `bgGradient`, `iconBg`, `iconColor` entirely. Remove "Live Data" animate-ping; replace with plain `text-muted` "Updated [timestamp]" line. Fix `calculateTrend` to return "New" when prior-month is 0 (F-17).
2. **Records table.** Remove `glass-panel` className from toolbar and table card; replace with `bg-surface border border-border shadow-sm`. Change search placeholder to the honest version (F-06). Wire loading overlay: when `isPending`, overlay the tbody with a `role="status" aria-label="Loading"` spinner and `opacity-50`. Replace raw `bg-emerald-500`/`bg-rose-500` status badges with semantic tokens (`text-status-positive` on `bg-status-positive/10`).
3. **Wizard focus + announce (F-02).** Add a visually-hidden `aria-live="polite"` region to `form-layout.tsx` that announces step changes. In `goToStep` and `handleNext`/`handlePrevious`, after `setCurrentStep`, ref-focus the new step's h2. Each `step*.tsx` file: add `<h2 ref={headingRef} tabIndex={-1}>...`.
4. **Keyboard shortcuts (F-12).** New `hooks/use-keyboard-shortcuts.ts`. Bind: Alt+ArrowRight = handleNext, Alt+ArrowLeft = handlePrevious, Alt+1..9 = goToStep(n), Esc = close mobile drawer, `/` = focus search (on records page). Document in a `<Sheet>` triggered by `?`.
5. **Autosave UX (F-07).** Replace fixed `setInterval` with debounced save on `formState.isDirty` change (30s debounce). Remove the toast on successful autosave — rely on the existing "Last saved: X ago" line in progress-sidebar. Keep the toast for failures. Remove `localStorage.setItem("jobseeker-draft", ...)` entirely; rely on the RLS-protected `jobseeker_drafts` server table. In `signOut` action, also `localStorage.removeItem("jobseeker-draft")` to clean any legacy value.
6. **Toast emoji strip (F-15).** Remove all emoji from toast `title` strings in `form-layout.tsx` and elsewhere. Rely on the toast variant for visual signal.
7. **User-facing errors (F-09).** Create `lib/errors/user-facing.ts` that maps known Supabase error codes to encoder-friendly messages. Update every `return { error: error.message }` in `jobseekers/actions.ts` and `register/actions.ts` to go through the mapper.
8. **Profile view.** Token-based status badges. No behavior change.

### Verification (Phase 2)
- `tsc`, `lint`, `build` pass.
- Keyboard-only walk-through of `/jobseekers/register`:
  - Alt+→ advances step; focus lands on new h2; aria-live region announces "Step 3 of 9: Job Preference".
  - Alt+1..9 jumps; same focus + announce behavior.
  - Esc closes mobile drawer.
  - Ctrl+S still saves draft (existing).
- Records list:
  - Search debounces; loading overlay visible during `isPending`.
  - Placeholder reads accurately.
  - Status badges render in semantic token colors (verify both light and dark mode).
- Dashboard:
  - Six stats in one visual treatment, no gradients.
  - No pulsing dot; timestamp is static.
- Autosave: verify in devtools that no `setInterval` fires when form is pristine; no toast on success.

---

## 7. Phase 3 — Admin, edge pages, polish

**One PR. Branch: `redesign/phase-3-polish`. Target ~300 LOC.**

### Files touched
- `app/(app)/users/page.tsx`, `users/pending/page.tsx`
- `app/(app)/users/_components/*.tsx` (status-badge, role-badge, user-actions-menu, users-table)
- `app/not-found.tsx` (new) — custom 404
- `app/(app)/error.tsx`, `app/(auth)/error.tsx` (new) — error boundaries
- `app/(auth)/forgot-password/page.tsx` — polish to match Phase 1
- `components/keyboard-help-popover.tsx` (new)
- Final polish on any remaining surface

### Tasks
1. **Users admin.** Replace raw `bg-emerald-50 text-slate-400` hover state (F-13) with token colors. Token-based status/role badges. Add search-by-email server-side (fixes Ramon persona red flag).
2. **Pending page.** Copy rewrite: replace "If you have any questions, please contact your system administrator" with specific name/contact if configured, or at minimum "Contact `{env.NEXT_PUBLIC_ADMIN_EMAIL}` if approval takes more than 24 hours." Add sign-out button (currently terminal). Add "your request was submitted at [timestamp]" line.
3. **Forgot-password.** Full redesign to match Phase 1 auth patterns (deferred from P1 to keep that PR small).
4. **Custom 404.** `app/not-found.tsx` with branded copy, link back to dashboard/login depending on auth state.
5. **Error boundaries.** `app/(app)/error.tsx` and `app/(auth)/error.tsx` that render a branded "Something went wrong. Contact your admin." with a reset button.
6. **Keyboard help popover.** `components/keyboard-help-popover.tsx` — opens with `?`. Documents all shortcuts from Phase 2. Trigger in DashboardShell header.
7. **Typography polish.** Final pass on line-heights, letter-spacing, text-wrap balance on headings, tabular-nums on data cells.
8. **Dead code sweep.** Remove the unused `Label` import in `step4-language.tsx` and `EDUCATION_LEVELS` in `step5-education.tsx` (both pre-existing lint warnings).

### Verification (Phase 3)
- `tsc`, `lint`, `build` pass.
- Manual walk: force a 404, a runtime error, a pending-user session. All render branded surfaces with correct escape hatches.
- `?` opens keyboard help; shortcuts listed match what Phase 2 actually implements.
- Final Lighthouse pass on /login, /jobseekers, /jobseekers/register — Accessibility score ≥ 95.

---

## 8. Target scorecard (before → after)

| Metric | Current | Target after Phase 3 |
|---|---|---|
| `/audit` total | 11/20 | ≥ 17/20 |
| Nielsen total | 19/40 | ≥ 32/40 |
| AI-slop tells (deterministic) | 2 real + 3 FP | 0 |
| WCAG 2.1 AA violations | 3 (F-02, F-04, contrast risks) | 0 |
| Raw Tailwind color classes in app code | 15+ files | ≤ 2 files (ui/ primitives only) |
| Keyboard shortcuts | 1 (Ctrl+S) | 5+ (documented) |
| Hero-metric gradient cards | 6 | 0 |
| Blur-orb decorative divs | 4 | 0 |
| Glassmorphism auth cards | 3 | 0 |

## 9. Risks

- **Serif font adds ~20KB gzipped.** Acceptable for an internal tool; offset by removing blur-orb layout cost (backdrop-filter is GPU-heavy on older province workstations).
- **Stripping blur/glass may feel austere on first glance.** Intentional — government tool, not consumer SaaS. If reviewers push back, Phase 1 alone can be previewed before merging.
- **Alt+ArrowLeft/Right conflicts with browser back/forward on Windows.** Mitigation: in the shortcut handler, call `e.preventDefault()` only when focus is within the wizard (`document.activeElement?.closest('[data-wizard]')`). Verify during Phase 2.
- **Autosave behavior change may surprise current encoders.** Mitigation: "Last saved" indicator in the progress sidebar is the visible signal; add a one-time welcome toast on first load after upgrade explaining the change.
- **`jobseeker_drafts` server table becomes sole draft store.** Existing localStorage drafts on encoders' machines will be ignored. Document in a one-time migration note.

## 10. Dependencies / open decisions I'll resolve during implementation

- Exact serif weight (500 vs 600) — decide by eye once Source Serif 4 is loaded.
- Whether to keep the "Live Data" indicator as a static "Updated at HH:MM" line or remove entirely. Plan removes; happy to retain as static text if you prefer a recency signal.
- Whether Phase 3's "keyboard help popover" lives in the shell header (discoverable) or only on `?` press (quieter). Plan is quiet + `?`.

## 11. What is NOT in this plan

- **F-01 (PII in URL query strings).** Architectural change. Separate ticket.
- **All P0/P1 security findings** from the prior review (RLS escalation, jobseekers RLS, etc.). Must-fix before production but outside UI/UX scope.
- **New features.** Nothing added beyond what fixes audit findings.
- **Backend changes** except the error-mapper helper in Phase 2.
