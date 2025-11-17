-- Fix RPC functions to return SETOF for proper Supabase RPC handling
-- Must drop and recreate to change return type

-- Drop existing functions
DROP FUNCTION IF EXISTS public.rider_report_delivery(uuid, text);
DROP FUNCTION IF EXISTS public.admin_confirm_delivery(uuid);

-- Recreate rider_report_delivery with SETOF return
CREATE FUNCTION public.rider_report_delivery(order_id uuid, payment_method text DEFAULT NULL)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order public.orders;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  IF NOT has_role(auth.uid(), 'rider'::public.app_role_new) THEN
    RAISE EXCEPTION 'Access denied: Rider role required';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = rider_report_delivery.order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.order_type <> 'delivery' THEN
    RAISE EXCEPTION 'Only delivery orders can be reported by riders';
  END IF;

  IF v_order.status NOT IN ('pending','confirmed') THEN
    RAISE EXCEPTION 'Order is not in a reportable state: %', v_order.status;
  END IF;

  -- Rider must be assigned OR name match (case/space tolerant)
  IF v_order.assigned_rider_id IS DISTINCT FROM auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND lower(btrim(p.full_name)) = lower(btrim(v_order.rider_number))
    ) THEN
      RAISE EXCEPTION 'You are not authorized to report this order';
    END IF;
  END IF;

  UPDATE public.orders
  SET status = 'awaiting_confirmation',
      payment_method = COALESCE(rider_report_delivery.payment_method, v_order.payment_method),
      assigned_rider_id = auth.uid(),
      updated_at = now()
  WHERE id = rider_report_delivery.order_id
  RETURNING * INTO v_order;

  RETURN NEXT v_order;
END;
$$;

-- Recreate admin_confirm_delivery with SETOF return
CREATE FUNCTION public.admin_confirm_delivery(order_id uuid)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order public.orders;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;

  IF NOT has_role(auth.uid(), 'admin'::public.app_role_new) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  UPDATE public.orders
  SET status = 'delivered',
      updated_at = now()
  WHERE id = admin_confirm_delivery.order_id
    AND status = 'awaiting_confirmation'
  RETURNING * INTO v_order;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not awaiting confirmation';
  END IF;

  RETURN NEXT v_order;
END;
$$;