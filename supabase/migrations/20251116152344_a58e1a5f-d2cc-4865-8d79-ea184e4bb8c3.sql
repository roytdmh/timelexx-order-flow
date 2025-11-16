-- ============================================================================
-- STEP 1: Add uniqueness constraint on profiles.full_name
-- ============================================================================

-- Add unique index on full_name (enforces uniqueness and NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_full_name_unique 
ON public.profiles(full_name) 
WHERE full_name IS NOT NULL;

-- ============================================================================
-- STEP 2: Simplify RLS policies for orders table
-- ============================================================================

-- Drop ALL existing update policies
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Riders can mark their assigned delivery orders as delivered" ON public.orders;
DROP POLICY IF EXISTS "orders_update_by_admins_or_riders_via_helper" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_update_rider" ON public.orders;
DROP POLICY IF EXISTS "orders_update_consolidated" ON public.orders;

-- Create new consolidated update policy with complete logic
CREATE POLICY "orders_update_consolidated" 
ON public.orders 
FOR UPDATE 
USING (
  -- Admins can update any order
  has_role(auth.uid(), 'admin'::app_role_new)
  OR
  -- Alternative admin check via JWT
  (auth.jwt() ->> 'user_role') = 'admin'
  OR
  -- Riders can update their assigned delivery orders when in allowed states
  (
    has_role(auth.uid(), 'rider'::app_role_new)
    AND order_type = 'delivery'
    AND assigned_rider_id = auth.uid()
    AND status IN ('pending', 'confirmed', 'preparing')
  )
  OR
  -- Security definer function check (backwards compatibility)
  can_update_order_for_dashboard_user(orders.*, orders.*)
  OR
  -- Alternative rider check via JWT
  (
    (auth.jwt() ->> 'user_role') = 'rider'
    AND assigned_rider_id = current_auth_uid()
    AND status IN ('pending', 'confirmed', 'preparing')
  )
)
WITH CHECK (
  -- Admins can set any status
  has_role(auth.uid(), 'admin'::app_role_new)
  OR
  -- Riders can only set status to 'awaiting_confirmation' (reporting delivery)
  (
    has_role(auth.uid(), 'rider'::app_role_new)
    AND order_type = 'delivery'
    AND assigned_rider_id = auth.uid()
    AND status = 'awaiting_confirmation'
  )
  OR
  -- Security definer function check (backwards compatibility)
  can_update_order_for_dashboard_user(orders.*, orders.*)
  OR
  -- Alternative rider check via JWT
  (
    (auth.jwt() ->> 'user_role') = 'rider'
    AND assigned_rider_id = current_auth_uid()
    AND status = 'awaiting_confirmation'
  )
);