-- Update reset function to clear all orders except customer order history
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Delete order items for today's orders that are NOT customer order history
  -- Customer order history = delivered/cancelled orders that belong to a customer
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders
    WHERE DATE(created_at) = CURRENT_DATE
    AND NOT (customer_user_id IS NOT NULL AND status IN ('delivered', 'cancelled'))
  );

  -- Delete today's orders that are NOT customer order history
  DELETE FROM public.orders
  WHERE DATE(created_at) = CURRENT_DATE
  AND NOT (customer_user_id IS NOT NULL AND status IN ('delivered', 'cancelled'));
END;
$function$;