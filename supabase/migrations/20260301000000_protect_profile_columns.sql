-- Protect privileged profile columns from self-modification.
-- Only users with role='admin' AND status='active' may change role, status,
-- or updated_by. Non-admins can still update their own full_name.

create or replace function public.is_active_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
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

comment on function public.is_active_admin is
  'True when the calling user has role=admin and status=active. Use this inside
   triggers and policies that gate privileged actions.';

create or replace function public.is_active_user()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  return exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and status = 'active'
  );
end;
$$;

comment on function public.is_active_user is
  'True when the calling user has an active profile (any role). Gates
   everyday mutations like creating jobseeker records.';

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_active_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Only admins can change role'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    raise exception 'Only admins can change status'
      using errcode = '42501';
  end if;

  if new.updated_by is distinct from old.updated_by then
    raise exception 'Only admins can set updated_by'
      using errcode = '42501';
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'user_id is immutable'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();
