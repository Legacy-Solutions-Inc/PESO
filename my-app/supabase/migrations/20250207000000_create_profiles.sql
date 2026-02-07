-- Profiles table for PESO staff: role-based access (admin / encoder).
-- New sign-ups get default role 'encoder'; admins can be promoted via admin UI or DB.
create table if not exists public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'encoder' check (role in ('admin', 'encoder')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

comment on table public.profiles is 'PESO staff profiles with role (admin/encoder).';

-- RLS: users can read/update own row; admins can read/update others (handled in app or policy).
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Service role or trigger will insert; allow insert for authenticated users (trigger runs as invoker).
create policy "Allow insert for new user"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Create profile when a new user signs up (runs in auth context; definer so insert is allowed).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'encoder');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
