-- Fix RLS policy to remove 'preparing' status references
-- This policy was still blocking rider updates because it referenced the old 'preparing' status

DROP POLICY IF EXISTS "orders_update_consolidated" ON public.orders;

-- Recreate the policy without 'preparing' references
CREATE POLICY "orders_update_consolidated"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role_new) 
  OR ((auth.jwt() ->> 'user_role'::text) = 'admin'::text)
  OR (
    has_role(auth.uid(), 'rider'::app_role_new) 
    AND (order_type = 'delivery'::text) 
    AND (assigned_rider_id = auth.uid()) 
    AND (status = ANY (ARRAY['pending'::text, 'confirmed'::text]))
  )
  OR can_update_order_for_dashboard_user(orders.*, orders.*)
  OR (
    ((auth.jwt() ->> 'user_role'::text) = 'rider'::text) 
    AND (assigned_rider_id = current_auth_uid()) 
    AND (status = ANY (ARRAY['pending'::text, 'confirmed'::text]))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role_new) 
  OR (
    has_role(auth.uid(), 'rider'::app_role_new) 
    AND (order_type = 'delivery'::text) 
    AND (assigned_rider_id = auth.uid()) 
    AND (status = 'awaiting_confirmation'::text)
  )
  OR can_update_order_for_dashboard_user(orders.*, orders.*)
  OR (
    ((auth.jwt() ->> 'user_role'::text) = 'rider'::text) 
    AND (assigned_rider_id = current_auth_uid()) 
    AND (status = 'awaiting_confirmation'::text)
  )
);