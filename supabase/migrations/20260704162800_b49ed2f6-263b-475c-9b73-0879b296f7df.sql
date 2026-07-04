CREATE OR REPLACE FUNCTION public.admin_confirm_delivery(order_id uuid)
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

  SELECT * INTO v_order FROM public.orders WHERE id = admin_confirm_delivery.order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Allow completion for:
  --   * delivery orders that riders reported (awaiting_confirmation)
  --   * pickup orders in pending/confirmed (customer picked up in-store)
  IF v_order.status = 'awaiting_confirmation'
     OR (v_order.order_type = 'pickup' AND v_order.status IN ('pending','confirmed','placed'))
  THEN
    RETURN QUERY
    UPDATE public.orders
    SET status = 'delivered',
        updated_at = now()
    WHERE id = admin_confirm_delivery.order_id
    RETURNING *;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Order is not in a completable state: %', v_order.status;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_confirm_delivery(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_confirm_delivery(uuid) TO authenticated;