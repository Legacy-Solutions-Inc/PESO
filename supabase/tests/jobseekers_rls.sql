-- Run against a branched / local Supabase after applying migrations.
-- Seeds two users: active-encoder and pending-encoder.
--
-- Usage:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/jobseekers_rls.sql

begin;

-- Fixture: seed profiles (use service role to bypass RLS for setup)
set local role postgres;
insert into public.profiles (user_id, role, status)
values
  ('00000000-0000-0000-0000-000000000002', 'encoder', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'encoder', 'pending')
on conflict (user_id) do update
  set role = excluded.role, status = excluded.status;

-- Test A: active encoder CAN insert jobseeker
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000002';

insert into public.jobseekers (
  user_id, created_by, personal_info, employment, job_preference, skills
)
values (
  '00000000-0000-0000-0000-000000000002',
  'active@example.test',
  '{"surname":"Test","firstName":"Active","sex":"MALE","civilStatus":"SINGLE","dateOfBirth":"1990-01-01"}'::jsonb,
  '{"status":"EMPLOYED"}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
);

-- Test B: pending encoder CANNOT select jobseekers
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000003';

do $$
declare v_count int;
begin
  select count(*) into v_count from public.jobseekers;
  if v_count > 0 then
    raise exception 'FAIL: pending user read jobseekers (% rows visible)', v_count;
  end if;
end;
$$;

-- Test C: pending encoder CANNOT insert
do $$
declare v_raised boolean := false;
begin
  begin
    insert into public.jobseekers (
      user_id, created_by, personal_info, employment, job_preference, skills
    )
    values (
      '00000000-0000-0000-0000-000000000003',
      'pending@example.test',
      '{"surname":"X","firstName":"X","sex":"MALE","civilStatus":"SINGLE","dateOfBirth":"1990-01-01"}'::jsonb,
      '{"status":"EMPLOYED"}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb
    );
  exception when others then
    v_raised := true;
  end;
  if not v_raised then
    raise exception 'FAIL: pending user inserted jobseeker';
  end if;
end;
$$;

-- Test D: non-admin active user CANNOT delete
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000002';

do $$
declare v_affected int;
begin
  delete from public.jobseekers where created_by = 'active@example.test';
  get diagnostics v_affected = row_count;
  if v_affected > 0 then
    raise exception 'FAIL: non-admin deleted jobseekers';
  end if;
end;
$$;

rollback;
