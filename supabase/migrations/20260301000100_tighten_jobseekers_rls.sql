-- Replace the permissive 'auth.uid() is not null' policies on public.jobseekers
-- with policies gated on an active profile. Delete becomes admin-only.
-- Depends on public.is_active_user() and public.is_active_admin() from
-- 20260301000000_protect_profile_columns.sql.

-- Drop existing permissive policies
drop policy if exists "Authenticated users can read jobseekers" on public.jobseekers;
drop policy if exists "Authenticated users can insert jobseekers" on public.jobseekers;
drop policy if exists "Authenticated users can update jobseekers" on public.jobseekers;
drop policy if exists "Authenticated users can delete jobseekers" on public.jobseekers;

-- Recreate: active profile required for read/write
create policy "Active users can read jobseekers"
  on public.jobseekers for select
  using (public.is_active_user());

create policy "Active users can insert jobseekers"
  on public.jobseekers for insert
  with check (public.is_active_user());

create policy "Active users can update jobseekers"
  on public.jobseekers for update
  using (public.is_active_user())
  with check (public.is_active_user());

-- Delete restricted to admins (defence-in-depth; Server Actions also
-- call requireAdmin)
create policy "Admins can delete jobseekers"
  on public.jobseekers for delete
  using (public.is_active_admin());

-- Same tightening on the draft table: users who are no longer active should
-- not be able to stash PII drafts.
drop policy if exists "Users can read own draft" on public.jobseeker_drafts;
drop policy if exists "Users can insert own draft" on public.jobseeker_drafts;
drop policy if exists "Users can update own draft" on public.jobseeker_drafts;
drop policy if exists "Users can delete own draft" on public.jobseeker_drafts;

create policy "Active users read own draft"
  on public.jobseeker_drafts for select
  using (auth.uid() = user_id and public.is_active_user());

create policy "Active users insert own draft"
  on public.jobseeker_drafts for insert
  with check (auth.uid() = user_id and public.is_active_user());

create policy "Active users update own draft"
  on public.jobseeker_drafts for update
  using (auth.uid() = user_id and public.is_active_user())
  with check (auth.uid() = user_id and public.is_active_user());

create policy "Active users delete own draft"
  on public.jobseeker_drafts for delete
  using (auth.uid() = user_id and public.is_active_user());
