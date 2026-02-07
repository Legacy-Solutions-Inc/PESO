-- ============================================
-- Jobseekers Registration Tables
-- ============================================

-- Main jobseekers table
create table if not exists public.jobseekers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete set null,
  
  -- Audit fields
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text not null, -- email of encoder
  status text not null default 'active' check (status in ('active', 'archived', 'pending')),
  
  -- JSONB data fields (9 sections)
  personal_info jsonb not null,
  employment jsonb not null,
  job_preference jsonb not null,
  language jsonb,
  education jsonb,
  training jsonb,
  eligibility jsonb,
  work_experience jsonb,
  skills jsonb not null,
  
  -- Searchable extracted fields (generated columns for filtering/indexing)
  surname text generated always as (personal_info->>'surname') stored,
  first_name text generated always as (personal_info->>'firstName') stored,
  sex text generated always as (personal_info->>'sex') stored,
  employment_status text generated always as (employment->>'status') stored,
  city text generated always as (personal_info->'address'->>'city') stored,
  province text generated always as (personal_info->'address'->>'province') stored,
  is_ofw boolean generated always as ((employment->>'isOfw')::boolean) stored,
  is_4ps_beneficiary boolean generated always as ((employment->>'is4PsBeneficiary')::boolean) stored
);

comment on table public.jobseekers is 'NSRP jobseeker registrations with full form data';

-- Indexes for search/filter performance
create index idx_jobseekers_surname on public.jobseekers (surname);
create index idx_jobseekers_first_name on public.jobseekers (first_name);
create index idx_jobseekers_sex on public.jobseekers (sex);
create index idx_jobseekers_employment_status on public.jobseekers (employment_status);
create index idx_jobseekers_city on public.jobseekers (city);
create index idx_jobseekers_province on public.jobseekers (province);
create index idx_jobseekers_is_ofw on public.jobseekers (is_ofw);
create index idx_jobseekers_is_4ps on public.jobseekers (is_4ps_beneficiary);
create index idx_jobseekers_created_at on public.jobseekers (created_at desc);
create index idx_jobseekers_user_id on public.jobseekers (user_id);

-- Updated_at trigger (reuse if function exists, otherwise create it)
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.jobseekers
  for each row execute function public.update_updated_at();

-- RLS policies
alter table public.jobseekers enable row level security;

-- All authenticated users (encoders/admins) can read all jobseekers
create policy "Authenticated users can read jobseekers"
  on public.jobseekers for select
  using (auth.uid() is not null);

-- All authenticated users can insert (encoder creates new registration)
create policy "Authenticated users can insert jobseekers"
  on public.jobseekers for insert
  with check (auth.uid() is not null);

-- All authenticated users can update (for edits)
create policy "Authenticated users can update jobseekers"
  on public.jobseekers for update
  using (auth.uid() is not null);

-- Only admins can delete (handled in app or add admin-check policy later)
create policy "Authenticated users can delete jobseekers"
  on public.jobseekers for delete
  using (auth.uid() is not null);

-- ============================================
-- Jobseeker Drafts Table
-- ============================================

create table if not exists public.jobseeker_drafts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  current_step int not null default 1,
  completed_steps int[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (user_id) -- One draft per user
);

comment on table public.jobseeker_drafts is 'Draft jobseeker registrations (one per user)';

create index idx_drafts_user_id on public.jobseeker_drafts (user_id);

-- Updated_at trigger
create trigger set_drafts_updated_at
  before update on public.jobseeker_drafts
  for each row execute function public.update_updated_at();

-- RLS policies
alter table public.jobseeker_drafts enable row level security;

-- Users can only access their own drafts
create policy "Users can read own draft"
  on public.jobseeker_drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert own draft"
  on public.jobseeker_drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own draft"
  on public.jobseeker_drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete own draft"
  on public.jobseeker_drafts for delete
  using (auth.uid() = user_id);
