-- Ensure waiter_user_id is automatically set for the authenticated user on insert
CREATE OR REPLACE FUNCTION public.set_order_waiter_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.waiter_user_id IS NULL THEN
    NEW.waiter_user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_order_waiter_user ON public.orders;
CREATE TRIGGER trg_set_order_waiter_user
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_waiter_user();

-- Reset only today's orders for the authenticated user
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  -- Log the reset action
  INSERT INTO public.activity_logs (user_id, action, resource_type, details)
  VALUES (
    auth.uid(),
    'reset_todays_orders',
    'orders',
    jsonb_build_object(
      'timestamp', now(),
      'user_id', auth.uid()
    )
  );

  -- Delete order items for today's orders of this user
  DELETE FROM public.order_items
  WHERE order_id IN (
    SELECT id FROM public.orders
    WHERE waiter_user_id = auth.uid()
      AND created_at >= date_trunc('day', now())
  );

  -- Delete today's orders for this user
  DELETE FROM public.orders
  WHERE waiter_user_id = auth.uid()
    AND created_at >= date_trunc('day', now());
END;
$$;