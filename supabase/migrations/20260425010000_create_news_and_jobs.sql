-- News & Jobs CMS — public-facing surface for PESO Lambunao.
--
-- Adds two admin-curated tables (news_posts, job_postings), one shared
-- updated_at trigger, RLS policies that let anon read currently-visible
-- content and admins read/write everything, plus a Storage bucket for
-- news photos.
--
-- MANUAL STEP (remote projects only):
--   The Storage bucket `public-media` is provisioned by the
--   `insert into storage.buckets` statement at the bottom, which works
--   against a local Supabase install where the storage schema is
--   preinstalled. On a remote / hosted project, if SQL alone cannot
--   create the bucket, run once via the Supabase CLI or dashboard:
--
--     supabase storage create-bucket public-media --public
--
--   The storage.objects RLS policies further down still apply either way.
--
-- All admin checks are inlined (matching the audit_log migration) so this
-- file remains self-contained — no dependency on a public.is_active_admin()
-- helper that may not exist in every environment.

-- --------------------------------------------------------------------
-- Shared trigger: keep updated_at honest on every UPDATE. Defined once
-- and attached to both new tables; will be reused by future CMS tables.
-- --------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: sets NEW.updated_at to now() on every UPDATE.';

-- --------------------------------------------------------------------
-- Table: news_posts
-- --------------------------------------------------------------------

create table public.news_posts (
  id            bigint generated always as identity primary key,
  caption       text not null,
  photos        jsonb not null default '[]'::jsonb,
  status        text not null default 'draft',
  is_pinned     boolean not null default false,
  published_at  timestamptz,
  author_id     uuid not null references auth.users (id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint news_posts_caption_length_chk
    check (char_length(caption) between 1 and 5000),
  constraint news_posts_status_chk
    check (status in ('draft', 'published', 'archived')),
  -- Shallow shape check; deep validation of each photo entry
  -- ({ path, alt_text, display_order }) lives in Zod inside the
  -- Server Action layer.
  constraint news_posts_photos_shape_chk
    check (
      jsonb_typeof(photos) = 'array'
      and jsonb_array_length(photos) <= 10
    )
);

comment on table public.news_posts is
  'Department announcements published to the public landing and /news.
   Plain-text caption + 0-10 photos in Supabase Storage. PESO-curated
   only; no comments, reactions, or public-author input. Pinned posts
   surface above the chronological feed; the most recently published
   pinned post wins when several are pinned at once.';

-- Landing/feed query: pinned-first, newest-first, only published rows.
create index idx_news_posts_landing_feed
  on public.news_posts (is_pinned desc, published_at desc)
  where status = 'published';

-- Admin status filter / chronological browse.
create index idx_news_posts_status_recent
  on public.news_posts (status, published_at desc);

-- FK index.
create index idx_news_posts_author on public.news_posts (author_id);

create trigger _200_news_posts_set_updated_at
before update on public.news_posts
for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------
-- Table: job_postings
-- --------------------------------------------------------------------

create table public.job_postings (
  id                   bigint generated always as identity primary key,
  title                text not null,
  employer_name        text not null,
  description          text not null,
  location             text not null,
  employment_type      text not null,
  salary_range_min     int,
  salary_range_max     int,
  application_deadline date not null,
  contact_email        text,
  contact_phone        text,
  status               text not null default 'draft',
  posted_at            timestamptz,
  created_by           uuid not null references auth.users (id) on delete restrict,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint job_postings_title_length_chk
    check (char_length(title) between 1 and 200),
  constraint job_postings_employer_length_chk
    check (char_length(employer_name) between 1 and 200),
  constraint job_postings_location_length_chk
    check (char_length(location) between 1 and 200),
  constraint job_postings_description_length_chk
    check (char_length(description) between 1 and 10000),
  constraint job_postings_employment_type_chk
    check (employment_type in (
      'FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'
    )),
  constraint job_postings_status_chk
    check (status in ('draft', 'active', 'closed', 'archived')),
  constraint job_postings_salary_nonneg_chk
    check (
      (salary_range_min is null or salary_range_min >= 0)
      and (salary_range_max is null or salary_range_max >= 0)
    ),
  constraint job_postings_salary_order_chk
    check (
      salary_range_min is null
      or salary_range_max is null
      or salary_range_max >= salary_range_min
    ),
  constraint job_postings_email_format_chk
    check (
      contact_email is null
      or contact_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
);

comment on table public.job_postings is
  'Job postings curated by PESO Lambunao staff. NOT employer self-service:
   no employer accounts, no application flow. Salary in PHP. Visibility on
   the public surface requires status = active AND application_deadline >=
   today; visitors apply in person at the Municipal Hall.';

-- Active-jobs query: status filter + deadline pruning.
create index idx_job_postings_active_by_deadline
  on public.job_postings (status, application_deadline);

-- Admin status filter / chronological browse.
create index idx_job_postings_status_recent
  on public.job_postings (status, posted_at desc);

-- FK index.
create index idx_job_postings_created_by on public.job_postings (created_by);

create trigger _200_job_postings_set_updated_at
before update on public.job_postings
for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------
-- Row Level Security — news_posts
-- --------------------------------------------------------------------

alter table public.news_posts enable row level security;

create policy "Public can read published news"
  on public.news_posts for select
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

create policy "Admins can read all news"
  on public.news_posts for select
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "Admins can insert news"
  on public.news_posts for insert
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
    and author_id = auth.uid()
  );

create policy "Admins can update news"
  on public.news_posts for update
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "Admins can delete news"
  on public.news_posts for delete
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

-- --------------------------------------------------------------------
-- Row Level Security — job_postings
-- --------------------------------------------------------------------

alter table public.job_postings enable row level security;

create policy "Public can read active jobs"
  on public.job_postings for select
  using (
    status = 'active'
    and application_deadline >= current_date
  );

create policy "Admins can read all jobs"
  on public.job_postings for select
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "Admins can insert jobs"
  on public.job_postings for insert
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
    and created_by = auth.uid()
  );

create policy "Admins can update jobs"
  on public.job_postings for update
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "Admins can delete jobs"
  on public.job_postings for delete
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

-- --------------------------------------------------------------------
-- Grants — table-level SELECT/DELETE, column-level INSERT/UPDATE.
-- RLS is the real authorization boundary.
-- --------------------------------------------------------------------

grant select on public.news_posts to anon;
grant select on public.news_posts to authenticated;
grant insert (caption, photos, status, is_pinned, published_at, author_id)
  on public.news_posts to authenticated;
grant update (caption, photos, status, is_pinned, published_at)
  on public.news_posts to authenticated;
grant delete on public.news_posts to authenticated;

grant select on public.job_postings to anon;
grant select on public.job_postings to authenticated;
grant insert (
    title, employer_name, description, location, employment_type,
    salary_range_min, salary_range_max, application_deadline,
    contact_email, contact_phone, status, posted_at, created_by
  ) on public.job_postings to authenticated;
grant update (
    title, employer_name, description, location, employment_type,
    salary_range_min, salary_range_max, application_deadline,
    contact_email, contact_phone, status, posted_at
  ) on public.job_postings to authenticated;
grant delete on public.job_postings to authenticated;

-- --------------------------------------------------------------------
-- Storage bucket: public-media
--   News photos at path news/{post_id}/{uuid}.{ext}.
--   Bucket is public-read so anon can fetch images via the public URL.
--   Path-shape enforcement (must live under news/{post_id}/) lives in
--   the Server Action layer — the policies below only gate by role.
-- --------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

create policy "Public can read public-media objects"
  on storage.objects for select
  using (bucket_id = 'public-media');

create policy "Admins can insert into public-media"
  on storage.objects for insert
  with check (
    bucket_id = 'public-media'
    and exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "Admins can update public-media"
  on storage.objects for update
  using (
    bucket_id = 'public-media'
    and exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  )
  with check (
    bucket_id = 'public-media'
    and exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

create policy "Admins can delete from public-media"
  on storage.objects for delete
  using (
    bucket_id = 'public-media'
    and exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );
