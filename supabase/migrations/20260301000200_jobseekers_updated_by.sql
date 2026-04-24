-- Add updated_by audit column. Server Action will populate it on update.
-- Default empty string lets the column be NOT NULL without breaking INSERTs
-- that don't set it (created_by is the corresponding field for creation).

alter table public.jobseekers
  add column if not exists updated_by text not null default '';

comment on column public.jobseekers.updated_by is
  'Email of the user who last updated this row. Set by the updateJobseeker
   Server Action; not directly editable by end users.';
