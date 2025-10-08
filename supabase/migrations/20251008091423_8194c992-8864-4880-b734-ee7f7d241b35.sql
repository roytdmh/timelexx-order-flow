-- Secure reset_todays_orders to admin only
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  -- Restrict to admins via user_roles
  IF NOT public.has_role(auth.uid(), 'admin'::app_role_new) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

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