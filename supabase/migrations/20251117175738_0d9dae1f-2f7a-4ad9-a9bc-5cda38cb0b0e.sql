-- Remove 'preparing' stage from order workflow
-- Updated workflow: placed → confirmed → awaiting_confirmation → delivered

create or replace function public.can_update_order_for_dashboard_user(old_row orders, new_row orders)
returns boolean
language plpgsql
stable
security definer
set search_path = 'public', 'pg_catalog', 'pg_temp'
as $$
begin
  -- Allow admins to update anything
  if has_role((select auth.uid() as uid), 'admin'::app_role_new) then
    return true;
  end if;

  -- Allow riders to report delivery complete (awaiting admin confirmation)
  -- Status can be: pending, confirmed (no more preparing)
  if has_role((select auth.uid() as uid), 'rider'::app_role_new)
     and old_row.order_type = 'delivery'
     and old_row.status = any (array['pending','confirmed'])
     and new_row.status = 'awaiting_confirmation' then
    return true;
  end if;

  -- Allow riders to mark delivery orders as delivered 
  if has_role((select auth.uid() as uid), 'rider'::app_role_new)
     and old_row.order_type = 'delivery'
     and old_row.status = any (array['pending','confirmed'])
     and new_row.status = 'delivered' then
    return true;
  end if;

  return false;
end;
$$;