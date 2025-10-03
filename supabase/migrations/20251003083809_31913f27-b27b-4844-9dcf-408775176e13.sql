-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;

DROP POLICY IF EXISTS "Public can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can delete order items" ON public.order_items;

-- Create comprehensive public access policies for orders
CREATE POLICY "Public can view all orders" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Public can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update orders" ON public.orders
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete orders" ON public.orders
  FOR DELETE USING (true);

-- Create comprehensive public access policies for order_items
CREATE POLICY "Public can view all order items" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "Public can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update order items" ON public.order_items
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete order items" ON public.order_items
  FOR DELETE USING (true);

-- Recreate the reset_todays_orders function without authentication checks
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete order items for today's orders first (foreign key constraint)
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders
    WHERE DATE(created_at) = CURRENT_DATE
  );

  -- Delete today's orders
  DELETE FROM public.orders
  WHERE DATE(created_at) = CURRENT_DATE;
END;
$$;