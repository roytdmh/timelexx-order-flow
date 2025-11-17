-- Function: set assigned_rider_id automatically based on rider_number
-- Rationale: Riders can only see orders when orders.assigned_rider_id = auth.uid() due to RLS.
-- Client-side lookup of profiles is blocked by RLS, so we set it server-side.

create or replace function public.set_assigned_rider_id_from_name()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  -- Only set when delivery order and we don't already have an assigned rider
  if new.order_type = 'delivery' and new.assigned_rider_id is null then
    if new.rider_number is not null then
      select p.user_id
      into new.assigned_rider_id
      from public.profiles p
      where p.full_name = new.rider_number
      limit 1;
    end if;
  end if;
  return new;
end;
$$;

-- Create trigger to run on insert and when rider_number changes
create trigger trg_orders_set_assigned_rider
before insert or update of rider_number on public.orders
for each row
execute function public.set_assigned_rider_id_from_name();

-- One-time backfill to fix existing rows (safe to re-run)
update public.orders o
set assigned_rider_id = p.user_id
from public.profiles p
where o.order_type = 'delivery'
  and o.assigned_rider_id is null
  and o.rider_number is not null
  and p.full_name = o.rider_number;