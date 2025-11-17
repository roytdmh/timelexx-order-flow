-- Fix Awaga rider visibility by consolidating profiles
-- The issue: awaga@timelexx.rider has no profile, but rider@timelexx.com has the 'Awaga' profile

-- 1) Update the old profile to point to the new rider account
update public.profiles
set user_id = '543c620d-d78c-4cfb-bac8-ed49cfad91cc',
    email = 'awaga@timelexx.rider',
    updated_at = now()
where user_id = '266cbdb7-a323-4528-8a28-03f7f1ab20f4'
  and full_name = 'Awaga';

-- 2) Update user_roles for the new account
delete from public.user_roles where user_id = '266cbdb7-a323-4528-8a28-03f7f1ab20f4';

insert into public.user_roles (user_id, role)
values ('543c620d-d78c-4cfb-bac8-ed49cfad91cc', 'rider')
on conflict (user_id, role) do nothing;

-- 3) Reassign all orders from old user_id to new user_id
update public.orders
set assigned_rider_id = '543c620d-d78c-4cfb-bac8-ed49cfad91cc'
where assigned_rider_id = '266cbdb7-a323-4528-8a28-03f7f1ab20f4';

-- 4) Improve the trigger to prefer @timelexx.rider emails
create or replace function public.set_assigned_rider_id_from_name()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if new.order_type = 'delivery' and new.assigned_rider_id is null then
    if new.rider_number is not null then
      select p.user_id
        into new.assigned_rider_id
      from public.profiles p
      where p.full_name = new.rider_number
      order by (p.email ilike '%@timelexx.rider') desc, p.created_at desc
      limit 1;
    end if;
  end if;
  return new;
end;
$$;