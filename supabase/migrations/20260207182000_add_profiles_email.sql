-- Store email in profiles so User Management can display it without requiring
-- auth.admin on every request. Populated on signup and backfilled from auth.users.

alter table public.profiles
  add column if not exists email text;

comment on column public.profiles.email is 'Cached email from auth.users for display in admin user list.';

-- Backfill existing profiles from auth.users (migration runs with sufficient privileges)
update public.profiles p
set email = u.email
from auth.users u
where p.user_id = u.id
  and (p.email is null or p.email = '');

-- New signups: set email in trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role, status, email)
  values (new.id, 'encoder', 'pending', new.email);
  return new;
end;
$$;
