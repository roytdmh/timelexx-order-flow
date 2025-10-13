-- Fix security warning by setting search_path
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delete order items for today's orders that are NOT customer order history
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