# PESO Lambunao — Responsive Conventions

This document is the contract for every UI surface in the app, current and future. Every page, component, and form must comply. New surfaces (the planned public landing, news, jobs, privacy pages) inherit these rules automatically — no exceptions.

---

## 1. Minimum supported viewport

**320 × 568 (iPhone SE 1st gen)** is the floor. Every route must render without horizontal scroll, every interactive element must be reachable, and every form must be completable at this size.

## 2. Breakpoint contract

Tailwind defaults; do not invent new ones.

| Token | Min width | Class | Surface band |
|---|---|---|---|
| (none) | 320px | (default) | **Mobile** |
| `sm` | 640px | `sm:` | Mobile / phablet |
| `md` | 768px | `md:` | **Tablet** |
| `lg` | 1024px | `lg:` | **Desktop** |
| `xl` | 1280px | `xl:` | Desktop wide |
| `2xl` | 1536px | `2xl:` | Desktop ultra-wide |

**Mobile = `<sm`. Tablet = `sm`–`lg`. Desktop = `≥lg`.** Authoring style is mobile-first: write the smallest variant first, layer up.

## 3. Container pattern

```tsx
<div className="mx-auto px-4 sm:px-6 lg:px-8">…</div>
```

Per-surface max-widths:

| Surface type | Max width |
|---|---|
| Auth card | `max-w-md` (~28rem) |
| Editorial / single-record (jobseeker profile) | none — fills the dashboard content area |
| Records list / data tables | none — fills |
| Forms / wizards | `max-w-3xl` for body content, with desktop sidebar outside |
| Public marketing pages | `max-w-6xl` for hero/feature blocks |

The dashboard shell already provides outer padding, so inner pages should not double-pad — they get `pb-*` and content directly.

## 4. Touch targets

**Minimum 44 × 44 logical px.** Project token: `min-h-11 min-w-11`. Apply on every interactive element — buttons, icon buttons, links rendered as buttons, checkboxes/radios with custom containers, accordion triggers, table-row action icons, dropdown items.

## 5. Tap feedback

Mobile has **no hover**. Every clickable element must have:

- `hover:` — desktop pointer feedback (color shift / underline)
- `active:` — touch press feedback (color or `active:opacity-90`)
- `focus-visible:ring-*` — keyboard ring

`hover:bg-foo` *without* `active:bg-bar` (or `active:opacity-*`) is a regression.

## 6. Form input UX defaults

For every input, set the matching mobile-keyboard hints. **No exceptions.**

| Input type | Required attributes |
|---|---|
| **Email** | `type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}` |
| **Phone** | `type="tel" inputMode="tel" autoComplete="tel"` |
| **Numeric** (height, age, year, salary, hours) | `inputMode="numeric"` plus `pattern="[0-9]*"`. **Never `type="number"`** — known mobile UX issues (scroll-wheel value changes, no comma support, broken validation). |
| **Date (simple)** | Native `type="date"` — works well in modern mobile browsers |
| **Date (rich)** | shadcn `Calendar` in `Popover` — Calendar component must support touch |
| **Search** | `type="search" inputMode="search" autoComplete="off"` |
| **Given name** | `autoComplete="given-name"` |
| **Family name** | `autoComplete="family-name"` |
| **Address line / street** | `autoComplete="street-address"` |
| **City** | `autoComplete="address-level2"` |
| **Province** | `autoComplete="address-level1"` |
| **Currency** | `inputMode="decimal"` — never `type="number"` |
| **OTP / TIN / contact-numeric** | `inputMode="numeric" pattern="[0-9]*"` |
| **Current password** | `type="password" autoComplete="current-password"` |
| **New password** | `type="password" autoComplete="new-password"` |

## 7. Text wrapping rules

- **Long names, addresses, emails:** `wrap-break-word` (long surname like "Prudente-de la Cruz" must not overflow). Already in use in the profile view.
- **Never truncate jobseeker names.** Always render in full; let the line wrap.
- **Truncate long values only in dense table cells.** Pair with a `Tooltip` that exposes the full value.
- Subtitle / breadcrumb separators: prefer `parts.join("  ·  ")` so the browser breaks at spaces around the separator (avoids orphaned dots).

## 8. Reduced motion

Every transition longer than **200 ms**, and every animation more elaborate than fade or translate, must be wrapped in:

- Tailwind `motion-safe:` modifier — `motion-safe:animate-[…]`, or
- Guarded with the `prefers-reduced-motion: reduce` media query in CSS.

Loading skeletons should not shimmer when reduced motion is requested. Accordion / sheet / dialog enter+exit transitions inherit this from Radix when wrapped correctly.

The base `<body>` rule already in `app/globals.css` shortens animations globally to `0.01ms` when reduced motion is set. New ad-hoc transitions still need `motion-safe:` so they don't flash.

## 9. Table → card decision tree

Trigger the card pattern when a table has **> 5 columns** at desktop.

| Viewport | Pattern |
|---|---|
| `<sm` | Each row → card. Stack: avatar/title block, secondary meta line, status chip, action buttons. Full-width. Bulk-action bar sticks to the bottom of the viewport when ≥1 selected. |
| `sm`–`md` | Keep the table but hide low-priority columns (date registered, sex sub-line, NSRP-ID subline). The hidden info should still be reachable via tooltip in the name cell. |
| `≥lg` | Full table. |

### Reference excerpt (from `jobseekers-table.tsx`)

```tsx
{/* Card list at <sm */}
<ul className="space-y-3 sm:hidden" role="list">
  {data.map((j) => (
    <li key={j.id} className="rounded-lg border border-border p-4">…</li>
  ))}
</ul>

{/* Table at ≥sm with hidden columns at sm-md */}
<div className="hidden overflow-x-auto sm:block">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead className="hidden lg:table-cell">Sex</TableHead>
        <TableHead className="hidden lg:table-cell">Date Registered</TableHead>
        …
      </TableRow>
    </TableHeader>
  </Table>
</div>
```

## 10. Sidebar / drawer pattern

When a layout has primary side navigation, replace it with a shadcn `Sheet` drawer at `<lg`, triggered by a hamburger button in the top bar.

- Drawer slides in from the **left** for primary nav.
- Drawer must **close on route change** (use `usePathname` effect).
- Drawer must **trap focus** while open and **restore focus** to the trigger on close (Radix Sheet handles this).
- Top bar (logo, page title, notifications, user menu) stays visible at all viewports.

## 11. Step-wizard pattern

(For the jobseeker registration form and any future multi-step form.)

| Viewport | Stepper | Navigation |
|---|---|---|
| `≥lg` | Sidebar stepper (full step list, completion state) | Inline Prev / Next at the bottom of the form body |
| `<lg` | Sticky top stepper: `Step N of M · {step title}` with a thin progress bar (N/M width). Tap on the title opens a Sheet listing all steps with completion state — user can jump to any completed step. | Sticky bottom: 2-col grid Prev (outline) / Next (primary), full-width, `min-h-11` each. Disable Prev on Step 1; rename Next to "Submit" on the last step. Save-as-draft moves into an overflow menu. |

## 12. Test matrix

Every PR that touches UI must be eyeballed in Chrome DevTools device emulation at:

| Device | Viewport |
|---|---|
| iPhone SE (1st gen) | 320 × 568 |
| Galaxy A53 | 360 × 740 |
| iPhone 14 | 390 × 844 |
| iPad mini | 768 × 1024 |
| Laptop | 1280 × 800 |
| Desktop | 1920 × 1080 |

…and at least one real touch device. Look for: zero horizontal scroll, all interactive elements ≥44×44, visible focus, no text overlap, all forms completable.

## 13. Accessibility floor

- One `<main>` per page (provided by the dashboard shell for app routes).
- Headings semantic and ordered: `<h1>` once, `<h2>` for primary sections, `<h3>` for sub-sections.
- Every form input has a `<Label>` associated by `htmlFor`/`id`.
- Every icon button has an `aria-label`.
- Every interactive element is reachable by Tab and activatable by Enter / Space.
- Visible focus ring on every focusable element (`focus-visible:ring-2 focus-visible:ring-ring`).

## 14. Public pages (forward-looking)

Routes planned under `app/(public)/*` (landing, news, jobs, privacy) follow the same conventions plus:

- Container `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`.
- Hero section: serif `<h1>` with `font-serif text-[clamp(2.25rem,5vw,4rem)] font-medium tracking-[-0.025em]`.
- Body prose: `max-w-prose` for paragraph blocks (~65 char lines).
- Public navigation in a top bar that becomes a hamburger Sheet at `<md`.
- Public pages are anonymous — no Supabase auth; static or SSR-only.

---

**This doc is loaded via CLAUDE.md so every future change inherits its rules. Update it when conventions evolve; do not let surfaces drift.**
