## 2026-02-12 - Auth Forms Loading States and Visibility Toggles
**Learning:** Authentication forms were missing basic loading indicators during submission and lacked password visibility toggles, which are critical for usability and error reduction.
**Action:** When working on forms with `useActionState`, ensure `isPending` is used to provide feedback. Consider extracting password visibility logic into a reusable `<PasswordInput />` component for consistency.
