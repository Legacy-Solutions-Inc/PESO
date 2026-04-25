-- Append-only audit log for destructive actions across the app.
-- Rows are inserted from SECURITY DEFINER RPCs that bundle the
-- action + audit write into one transaction so the log cannot
-- drift out of sync with the mutation it records.

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users (id) on delete restrict,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is
  'Append-only record of destructive / privileged actions. Writes come from
   SECURITY DEFINER RPCs; direct inserts are gated by RLS to auth.uid() = actor_id.
   No jobseeker PII ever appears in metadata - only actor identity and entity keys.';

create index idx_audit_log_created_at on public.audit_log (created_at desc);
create index idx_audit_log_actor_created on public.audit_log (actor_id, created_at desc);

alter table public.audit_log enable row level security;

-- Admins can read the full log.
-- Inlined admin check so this migration is self-contained and does not
-- depend on public.is_active_admin() existing yet.
create policy "Admins can read audit log"
  on public.audit_log for select
  using (
    exists (
      select 1
      from public.profiles as p
      where p.user_id = auth.uid()
        and p.role = 'admin'
        and p.status = 'active'
    )
  );

-- Any authenticated user can insert a row only for themselves. In practice
-- inserts come from the RPCs below; this is defence-in-depth.
create policy "Actors can insert own audit rows"
  on public.audit_log for insert
  with check (auth.uid() = actor_id);

-- No update or delete policies -> append-only.

-- --------------------------------------------------------------------
-- RPC: delete_jobseeker_with_audit
-- Atomically deletes one jobseeker row and inserts one audit row.
-- --------------------------------------------------------------------
create or replace function public.delete_jobseeker_with_audit(p_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_email text;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles as p
    where p.user_id = v_actor_id
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select u.email
    into v_actor_email
  from auth.users as u
  where u.id = v_actor_id;

  if v_actor_email is null then
    raise exception 'Actor email missing' using errcode = 'P0002';
  end if;

  delete from public.jobseekers
  where id = p_id;

  if not found then
    raise exception 'Jobseeker % not found', p_id using errcode = 'P0002';
  end if;

  insert into public.audit_log (
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_actor_id,
    v_actor_email,
    'DELETE_JOBSEEKER',
    'jobseeker',
    p_id,
    '{}'::jsonb
  );
end;
$$;

comment on function public.delete_jobseeker_with_audit(bigint) is
  'Admin-only: delete one jobseeker and append an audit_log row in a single
   transaction. Raises on non-admin caller, missing row, or missing actor email.';

revoke all on function public.delete_jobseeker_with_audit(bigint) from public;
grant execute on function public.delete_jobseeker_with_audit(bigint) to authenticated;

-- --------------------------------------------------------------------
-- RPC: bulk_delete_jobseekers_with_audit
-- Atomically deletes N jobseekers and inserts ONE audit row with
-- metadata = { ids, count }.
-- --------------------------------------------------------------------
create or replace function public.bulk_delete_jobseekers_with_audit(p_ids bigint[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_email text;
  v_deleted_count integer;
begin
  if v_actor_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles as p
    where p.user_id = v_actor_id
      and p.role = 'admin'
      and p.status = 'active'
  ) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'No ids provided' using errcode = '22023';
  end if;

  if array_length(p_ids, 1) > 500 then
    raise exception 'Bulk limit exceeded (max 500)' using errcode = '22023';
  end if;

  select u.email
    into v_actor_email
  from auth.users as u
  where u.id = v_actor_id;

  if v_actor_email is null then
    raise exception 'Actor email missing' using errcode = 'P0002';
  end if;

  with deleted as (
    delete from public.jobseekers
    where id = any(p_ids)
    returning id
  )
  select count(*) into v_deleted_count from deleted;

  insert into public.audit_log (
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_actor_id,
    v_actor_email,
    'BULK_DELETE_JOBSEEKERS',
    'jobseeker',
    null,
    jsonb_build_object(
      'ids', to_jsonb(p_ids),
      'count', v_deleted_count
    )
  );

  return v_deleted_count;
end;
$$;

comment on function public.bulk_delete_jobseekers_with_audit(bigint[]) is
  'Admin-only: delete many jobseekers and append one audit_log row with
   metadata = { ids, count } in a single transaction. Capped at 500 ids.';

revoke all on function public.bulk_delete_jobseekers_with_audit(bigint[]) from public;
grant execute on function public.bulk_delete_jobseekers_with_audit(bigint[]) to authenticated;
