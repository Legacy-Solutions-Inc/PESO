-- Database function to compute dashboard statistics efficiently
create or replace function get_dashboard_stats()
returns table (
  total bigint,
  new_this_month bigint,
  new_last_month bigint,
  employed bigint,
  unemployed bigint,
  ofw bigint,
  four_ps bigint
)
language sql
stable
as $$
  select
    count(*) filter (where status = 'active') as total,
    count(*) filter (
      where status = 'active'
        and created_at >= date_trunc('month', current_date)
    ) as new_this_month,
    count(*) filter (
      where status = 'active'
        and created_at >= date_trunc('month', current_date) - interval '1 month'
        and created_at < date_trunc('month', current_date)
    ) as new_last_month,
    count(*) filter (
      where status = 'active' and employment_status = 'EMPLOYED'
    ) as employed,
    count(*) filter (
      where status = 'active' and employment_status = 'UNEMPLOYED'
    ) as unemployed,
    count(*) filter (
      where status = 'active' and is_ofw = true
    ) as ofw,
    count(*) filter (
      where status = 'active' and is_4ps_beneficiary = true
    ) as four_ps
  from public.jobseekers;
$$;

comment on function get_dashboard_stats is 'Compute dashboard statistics: counts by employment, OFW, 4Ps, and monthly trends';
