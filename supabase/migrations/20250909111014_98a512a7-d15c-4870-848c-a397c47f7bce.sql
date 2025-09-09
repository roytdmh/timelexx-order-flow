-- Phase 1: Critical Security Fixes for Order Management System

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;
DROP POLICY IF EXISTS "Orders can be created by everyone" ON public.orders;
DROP POLICY IF EXISTS "Orders can be updated by everyone" ON public.orders;
DROP POLICY IF EXISTS "Orders can be deleted by everyone" ON public.orders;

DROP POLICY IF EXISTS "Order items are viewable by everyone" ON public.order_items;
DROP POLICY IF EXISTS "Order items can be created by everyone" ON public.order_items;

-- Create secure RLS policies for orders table
-- Kitchen staff can view all orders for management
CREATE POLICY "Kitchen staff can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_role('timelexx_kitchen'::app_role));

-- Kitchen staff can update order status and payment methods
CREATE POLICY "Kitchen staff can update orders" 
ON public.orders 
FOR UPDATE 
USING (has_role('timelexx_kitchen'::app_role));

-- Only kitchen staff can delete orders (for cleanup/cancellation)
CREATE POLICY "Kitchen staff can delete orders" 
ON public.orders 
FOR DELETE 
USING (has_role('timelexx_kitchen'::app_role));

-- Allow public order creation (customers placing orders)
-- But restrict sensitive fields that should only be set by kitchen staff
CREATE POLICY "Public can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Ensure sensitive fields are not set by public users
  status = 'pending' AND
  payment_method IS NULL AND
  assigned_rider_id IS NULL
);

-- Create secure RLS policies for order_items table
-- Kitchen staff can view all order items
CREATE POLICY "Kitchen staff can view all order items" 
ON public.order_items 
FOR SELECT 
USING (has_role('timelexx_kitchen'::app_role));

-- Allow public to create order items (part of order placement)
CREATE POLICY "Public can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Only kitchen staff can modify order items after creation
CREATE POLICY "Kitchen staff can update order items" 
ON public.order_items 
FOR UPDATE 
USING (has_role('timelexx_kitchen'::app_role));

CREATE POLICY "Kitchen staff can delete order items" 
ON public.order_items 
FOR DELETE 
USING (has_role('timelexx_kitchen'::app_role));

-- Create a secure function for resetting orders (kitchen staff only)
CREATE OR REPLACE FUNCTION public.reset_all_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has kitchen role
  IF NOT has_role(auth.uid(), 'timelexx_kitchen'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Kitchen staff role required';
  END IF;
  
  -- Log the reset action
  INSERT INTO public.activity_logs (user_id, action, resource_type, details)
  VALUES (
    auth.uid(),
    'reset_all_orders',
    'orders',
    jsonb_build_object(
      'timestamp', now(),
      'user_role', get_user_role(auth.uid())
    )
  );
  
  -- Delete all order items first (due to foreign key constraints)
  DELETE FROM public.order_items;
  
  -- Delete all orders
  DELETE FROM public.orders;
END;
$$;

-- Create a function to get order statistics (kitchen staff only)
CREATE OR REPLACE FUNCTION public.get_order_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if user has kitchen role
  IF NOT has_role(auth.uid(), 'timelexx_kitchen'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Kitchen staff role required';
  END IF;
  
  SELECT jsonb_build_object(
    'total_orders', COUNT(*),
    'pending_orders', COUNT(*) FILTER (WHERE status = 'pending'),
    'delivered_orders', COUNT(*) FILTER (WHERE status = 'delivered'),
    'cancelled_orders', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'total_revenue', COALESCE(SUM(total) FILTER (WHERE status = 'delivered'), 0)
  )
  INTO result
  FROM public.orders;
  
  RETURN result;
END;
$$;