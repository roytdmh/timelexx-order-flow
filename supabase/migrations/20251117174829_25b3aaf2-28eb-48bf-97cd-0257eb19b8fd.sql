-- Fix rider delivery workflow: allow riders to report delivery as 'awaiting_confirmation'
-- The function currently only allows riders to mark as 'delivered', but they should first
-- report as 'awaiting_confirmation' for admin verification

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
  if has_role((select auth.uid() as uid), 'rider'::app_role_new)
     and old_row.order_type = 'delivery'
     and old_row.status = any (array['pending','confirmed','preparing'])
     and new_row.status = 'awaiting_confirmation' then
    return true;
  end if;

  -- Allow riders to mark delivery orders as delivered when current status is in allowed set
  if has_role((select auth.uid() as uid), 'rider'::app_role_new)
     and old_row.order_type = 'delivery'
     and old_row.status = any (array['pending','confirmed','preparing'])
     and new_row.status = 'delivered' then
    return true;
  end if;

  return false;
end;
$$;