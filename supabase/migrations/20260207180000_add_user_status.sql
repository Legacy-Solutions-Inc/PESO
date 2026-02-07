-- Add status tracking and additional fields to profiles table
alter table public.profiles
  add column if not exists status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  add column if not exists full_name text,
  add column if not exists updated_by uuid references auth.users (id);

-- Add index for status filtering
create index if not exists idx_profiles_status on public.profiles (status);

-- Update the trigger function to set status as pending for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role, status)
  values (new.id, 'encoder', 'pending');
  return new;
end;
$$;

-- Drop existing admin policies if they exist (to recreate them)
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Create function to check if user is admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
end;
$$;

-- RLS Policy: Admins can read all profiles
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- RLS Policy: Admins can update all profiles
create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

comment on column public.profiles.status is 'User account status: pending (awaiting admin approval), active (can access system), inactive (disabled)';
comment on column public.profiles.full_name is 'Optional display name for user';
comment on column public.profiles.updated_by is 'Admin user who last updated this profile';
