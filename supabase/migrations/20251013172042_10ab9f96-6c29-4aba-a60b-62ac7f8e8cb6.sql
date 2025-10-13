-- Update reset_todays_orders function to preserve delivered and cancelled orders
CREATE OR REPLACE FUNCTION reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete order items for today's non-completed orders only
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders
    WHERE DATE(created_at) = CURRENT_DATE
    AND status NOT IN ('delivered', 'cancelled')
  );

  -- Delete today's non-completed orders only (preserving delivered/cancelled for history)
  DELETE FROM public.orders
  WHERE DATE(created_at) = CURRENT_DATE
  AND status NOT IN ('delivered', 'cancelled');
END;
$$;