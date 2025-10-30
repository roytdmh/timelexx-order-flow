-- Fix RLS policies to restrict rider access to assigned orders only

-- Drop existing problematic policies on orders
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Riders can mark delivery orders as delivered" ON public.orders;

-- Drop existing problematic policies on order_items
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;

-- Create improved policy for orders SELECT - riders can only see their assigned orders
CREATE POLICY "Users can view their relevant orders"
ON public.orders
FOR SELECT
USING (
  -- Customers can see their own orders
  (has_role(auth.uid(), 'customer'::app_role_new) AND customer_user_id = auth.uid())
  OR
  -- Admins can see all orders
  has_role(auth.uid(), 'admin'::app_role_new)
  OR
  -- Riders can ONLY see delivery orders assigned to them
  (has_role(auth.uid(), 'rider'::app_role_new) AND order_type = 'delivery' AND assigned_rider_id = auth.uid())
);

-- Recreate rider update policy with proper restrictions
CREATE POLICY "Riders can mark their assigned delivery orders as delivered"
ON public.orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'rider'::app_role_new) 
  AND order_type = 'delivery'
  AND assigned_rider_id = auth.uid()
  AND status = ANY(ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text])
)
WITH CHECK (
  has_role(auth.uid(), 'rider'::app_role_new)
  AND order_type = 'delivery'
  AND assigned_rider_id = auth.uid()
  AND status = 'delivered'::text
);

-- Create improved policy for order_items SELECT - aligned with orders policy
CREATE POLICY "Users can view order items for authorized orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      -- Customers can see items from their orders
      (has_role(auth.uid(), 'customer'::app_role_new) AND o.customer_user_id = auth.uid())
      OR
      -- Admins can see all order items
      has_role(auth.uid(), 'admin'::app_role_new)
      OR
      -- Riders can ONLY see items from orders assigned to them
      (has_role(auth.uid(), 'rider'::app_role_new) AND o.order_type = 'delivery' AND o.assigned_rider_id = auth.uid())
    )
  )
);

-- Add index for performance on assigned_rider_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_assigned_rider ON public.orders(assigned_rider_id) WHERE order_type = 'delivery';