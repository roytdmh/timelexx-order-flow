-- Secure RPCs to fix rider/admin delivery confirmation flow

-- 1) Rider reports delivery complete -> moves to awaiting_confirmation
CREATE OR REPLACE FUNCTION public.rider_report_delivery(order_id uuid, payment_method text DEFAULT NULL)
RETURNS public.orders
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

  -- Lock the order row for update
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

  -- Rider must be assigned OR name match the rider_number
  IF v_order.assigned_rider_id IS DISTINCT FROM auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.full_name = v_order.rider_number
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

  RETURN v_order;
END;
$$;

-- 2) Admin confirms delivery -> moves to delivered
CREATE OR REPLACE FUNCTION public.admin_confirm_delivery(order_id uuid)
RETURNS public.orders
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

  RETURN v_order;
END;
$$;