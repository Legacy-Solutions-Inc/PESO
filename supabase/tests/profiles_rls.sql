-- Run against a branched / local Supabase instance. Each assertion aborts
-- the transaction on failure, so a successful run prints no errors.
--
-- Usage:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/profiles_rls.sql
--
-- Prerequisite: seed a profile for user_id 00000000-...001 with
-- role='encoder' status='pending' before running, or adjust the UUID
-- to match an existing fixture.

begin;

-- Test 1: self-promotion to admin fails.
-- Simulate a pending encoder session by setting the JWT claim.
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000001';

do $$
declare
  v_raised boolean := false;
begin
  begin
    update public.profiles
    set role = 'admin'
    where user_id = '00000000-0000-0000-0000-000000000001';
  exception
    when insufficient_privilege then
      v_raised := true;
  end;
  if not v_raised then
    raise exception 'FAIL: non-admin self-promoted to admin';
  end if;
end;
$$;

-- Test 2: self-activation from pending fails.
do $$
declare
  v_raised boolean := false;
begin
  begin
    update public.profiles
    set status = 'active'
    where user_id = '00000000-0000-0000-0000-000000000001';
  exception
    when insufficient_privilege then
      v_raised := true;
  end;
  if not v_raised then
    raise exception 'FAIL: non-admin self-activated';
  end if;
end;
$$;

-- Test 3: non-admin may still edit their own full_name.
update public.profiles
set full_name = 'Test Encoder'
where user_id = '00000000-0000-0000-0000-000000000001';

rollback;
