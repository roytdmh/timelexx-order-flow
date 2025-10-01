-- Add waiter_user_id to orders table to track which waiter created the order
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS waiter_user_id uuid REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_waiter_user_id ON public.orders(waiter_user_id);

-- Update RLS policies for orders to filter by waiter
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to delete orders" ON public.orders;

-- Authenticated users can view only their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (waiter_user_id = auth.uid());

-- Authenticated users can create orders (waiter_user_id will be set automatically)
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (waiter_user_id = auth.uid());

-- Authenticated users can update only their own orders
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (waiter_user_id = auth.uid())
WITH CHECK (waiter_user_id = auth.uid());

-- Authenticated users can delete only their own orders
CREATE POLICY "Users can delete their own orders"
ON public.orders
FOR DELETE
TO authenticated
USING (waiter_user_id = auth.uid());

-- Update RLS policies for order_items to match orders
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users to update order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users to delete order items" ON public.order_items;

-- Users can view order items for their own orders
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.waiter_user_id = auth.uid()
  )
);

-- Users can create order items for their own orders
CREATE POLICY "Users can create their own order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.waiter_user_id = auth.uid()
  )
);

-- Users can update order items for their own orders
CREATE POLICY "Users can update their own order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.waiter_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.waiter_user_id = auth.uid()
  )
);

-- Users can delete order items for their own orders
CREATE POLICY "Users can delete their own order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.waiter_user_id = auth.uid()
  )
);

-- Update the reset_all_orders function to only reset current user's orders
CREATE OR REPLACE FUNCTION public.reset_all_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  -- Log the reset action
  INSERT INTO public.activity_logs (user_id, action, resource_type, details)
  VALUES (
    auth.uid(),
    'reset_all_orders',
    'orders',
    jsonb_build_object(
      'timestamp', now(),
      'user_id', auth.uid()
    )
  );
  
  -- Delete order items for user's orders first (due to foreign key constraints)
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders WHERE waiter_user_id = auth.uid()
  );
  
  -- Delete user's orders
  DELETE FROM public.orders WHERE waiter_user_id = auth.uid();
END;
$$;