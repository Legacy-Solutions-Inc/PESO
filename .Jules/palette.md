## 2026-02-12 - Auth Forms Loading States and Visibility Toggles
**Learning:** Authentication forms were missing basic loading indicators during submission and lacked password visibility toggles, which are critical for usability and error reduction.
**Action:** When working on forms with `useActionState`, ensure `isPending` is used to provide feedback. Consider extracting password visibility logic into a reusable `<PasswordInput />` component for consistency.

## 2026-02-17 - Table Actions Accessibility
**Learning:** Tables often use icon-only buttons (like "View", "Edit") to save space, but relying solely on `title` attributes or visual cues creates poor UX for keyboard/screen reader users.
**Action:** Consistently wrap table action buttons in `Tooltip` components (with `TooltipProvider` at the component level if not global) to provide clear, accessible labels on hover and focus.
