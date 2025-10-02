-- Remove the trigger that sets waiter_user_id
DROP TRIGGER IF EXISTS trg_set_order_waiter_user ON public.orders;
DROP FUNCTION IF EXISTS public.set_order_waiter_user();

-- Update RLS policies to allow public access to orders
DROP POLICY IF EXISTS "Kitchen staff can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;

CREATE POLICY "Public can view all orders" ON public.orders
FOR SELECT USING (true);

CREATE POLICY "Public can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update orders" ON public.orders
FOR UPDATE USING (true);

CREATE POLICY "Public can delete orders" ON public.orders
FOR DELETE USING (true);

-- Update order_items policies for public access
DROP POLICY IF EXISTS "Kitchen staff can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can update their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can delete their own order items" ON public.order_items;

CREATE POLICY "Public can view all order items" ON public.order_items
FOR SELECT USING (true);

CREATE POLICY "Public can create order items" ON public.order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update order items" ON public.order_items
FOR UPDATE USING (true);

CREATE POLICY "Public can delete order items" ON public.order_items
FOR DELETE USING (true);

-- Update reset function to work without authentication
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete order items for today's orders
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders
    WHERE created_at >= date_trunc('day', now())
  );

  -- Delete today's orders
  DELETE FROM public.orders
  WHERE created_at >= date_trunc('day', now());
END;
$$;