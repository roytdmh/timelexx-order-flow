-- Drop the overly restrictive public insert policy
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;

-- Create a more permissive policy for public order creation
-- Allow anyone to create orders with status='pending' initially
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
);

-- Also ensure the SELECT policy allows public to see their orders
DROP POLICY IF EXISTS "Kitchen staff can view all orders" ON public.orders;

CREATE POLICY "Kitchen staff can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role('timelexx_kitchen'::app_role));

-- Allow public/anonymous to view orders (so they can see confirmation)
CREATE POLICY "Public can view orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Ensure order_items can be viewed by everyone
DROP POLICY IF EXISTS "Kitchen staff can view all order items" ON public.order_items;

CREATE POLICY "Kitchen staff can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (has_role('timelexx_kitchen'::app_role));

CREATE POLICY "Public can view order items"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (true);