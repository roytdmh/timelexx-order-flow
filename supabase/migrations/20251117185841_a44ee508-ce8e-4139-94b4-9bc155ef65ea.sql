-- Update RLS policies to allow riders to report delivery when assigned_rider_id is not yet set
-- and to let riders view such orders via rider_number fallback

-- 1) Update SELECT policy: "Users can view their relevant orders"
DROP POLICY IF EXISTS "Users can view their relevant orders" ON public.orders;

CREATE POLICY "Users can view their relevant orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  -- Customers see their own orders
  (has_role(auth.uid(), 'customer'::app_role_new) AND customer_user_id = auth.uid())
  OR
  -- Admins see all
  has_role(auth.uid(), 'admin'::app_role_new)
  OR
  -- Riders see delivery orders assigned to them OR where rider_number matches their profile and assignment isn't set yet
  (
    has_role(auth.uid(), 'rider'::app_role_new)
    AND order_type = 'delivery'
    AND (
      assigned_rider_id = auth.uid()
      OR (
        assigned_rider_id IS NULL
        AND EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.full_name = rider_number
        )
      )
    )
  )
);

-- 2) Update UPDATE policy: "orders_update_consolidated"
DROP POLICY IF EXISTS "orders_update_consolidated" ON public.orders;

CREATE POLICY "orders_update_consolidated"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  -- Admins can update anything
  has_role(auth.uid(), 'admin'::app_role_new)
  OR ((auth.jwt() ->> 'user_role') = 'admin')
  OR (
    -- Riders can update their delivery orders while they are pending/confirmed
    has_role(auth.uid(), 'rider'::app_role_new)
    AND order_type = 'delivery'
    AND (
      assigned_rider_id = auth.uid()
      OR (
        assigned_rider_id IS NULL
        AND EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.full_name = rider_number
        )
      )
    )
    AND status = ANY (ARRAY['pending','confirmed'])
  )
  -- Keep compatibility with dashboard helper function
  OR can_update_order_for_dashboard_user(orders.*, orders.*)
  OR (
    ((auth.jwt() ->> 'user_role') = 'rider')
    AND (assigned_rider_id = current_auth_uid())
    AND status = ANY (ARRAY['pending','confirmed'])
  )
)
WITH CHECK (
  -- Admins can set any new values
  has_role(auth.uid(), 'admin'::app_role_new)
  OR (
    -- Riders can move to awaiting_confirmation on their orders
    has_role(auth.uid(), 'rider'::app_role_new)
    AND order_type = 'delivery'
    AND (
      assigned_rider_id = auth.uid()
      OR (
        assigned_rider_id IS NULL
        AND EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.full_name = rider_number
        )
      )
    )
    AND status = 'awaiting_confirmation'
  )
  -- Keep compatibility with dashboard helper function
  OR can_update_order_for_dashboard_user(orders.*, orders.*)
  OR (
    ((auth.jwt() ->> 'user_role') = 'rider')
    AND (assigned_rider_id = current_auth_uid())
    AND status = 'awaiting_confirmation'
  )
);
