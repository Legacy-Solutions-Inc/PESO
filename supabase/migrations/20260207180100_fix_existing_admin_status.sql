-- Set all existing admin users to active so they can access User Management.
-- New signups still get status = 'pending' from the trigger.
update public.profiles
set status = 'active', updated_at = now()
where role = 'admin' and (status = 'pending' or status is null);
