## 2026-02-12 - Auth Forms Loading States and Visibility Toggles
**Learning:** Authentication forms were missing basic loading indicators during submission and lacked password visibility toggles, which are critical for usability and error reduction.
**Action:** When working on forms with `useActionState`, ensure `isPending` is used to provide feedback. Consider extracting password visibility logic into a reusable `<PasswordInput />` component for consistency.

## 2026-02-12 - Accessibility in Data Tables
**Learning:** Data tables consistently use icon-only buttons for row actions and search inputs without visible labels, creating significant accessibility barriers.
**Action:** Systematically audit `Table` components for `aria-label` on search inputs and icon-only action buttons. Use descriptive labels that include the row's context (e.g., "Edit record for [Name]") instead of generic text.
