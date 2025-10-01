-- Fix RLS policies to allow anonymous users to update and delete orders
-- This is needed since the app currently doesn't have authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Kitchen staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Kitchen staff can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Kitchen staff can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Kitchen staff can delete order items" ON public.order_items;

-- Allow anonymous and authenticated users to update orders
CREATE POLICY "Allow users to update orders"
ON public.orders
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous and authenticated users to delete orders
CREATE POLICY "Allow users to delete orders"
ON public.orders
FOR DELETE
TO anon, authenticated
USING (true);

-- Allow anonymous and authenticated users to update order items
CREATE POLICY "Allow users to update order items"
ON public.order_items
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous and authenticated users to delete order items
CREATE POLICY "Allow users to delete order items"
ON public.order_items
FOR DELETE
TO anon, authenticated
USING (true);