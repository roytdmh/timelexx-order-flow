-- Improve rider name matching robustness (trim/case-insensitive)

-- 1) Replace consolidated UPDATE policy on orders with relaxed, resilient name match
DROP POLICY IF EXISTS orders_update_consolidated ON public.orders;

CREATE POLICY orders_update_consolidated
ON public.orders
FOR UPDATE
USING (
  -- Admins can update anything
  public.has_role(auth.uid(), 'admin'::public.app_role_new)
  OR (
    -- Riders can update delivery orders in progress if they are assigned OR name matches (case/space tolerant)
    public.has_role(auth.uid(), 'rider'::public.app_role_new)
    AND order_type = 'delivery'
    AND (
      assigned_rider_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND lower(btrim(p.full_name)) = lower(btrim(orders.rider_number))
      )
    )
    AND status = ANY (ARRAY['pending','confirmed'])
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role_new)
  OR (
    public.has_role(auth.uid(), 'rider'::public.app_role_new)
    AND order_type = 'delivery'
    AND (
      assigned_rider_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND lower(btrim(p.full_name)) = lower(btrim(orders.rider_number))
      )
    )
    AND status = 'awaiting_confirmation'
  )
);

-- 2) Update helper function to set assigned_rider_id with resilient match
CREATE OR REPLACE FUNCTION public.set_assigned_rider_id_from_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if new.order_type = 'delivery' and new.assigned_rider_id is null then
    if new.rider_number is not null then
      select p.user_id
        into new.assigned_rider_id
      from public.profiles p
      where lower(btrim(p.full_name)) = lower(btrim(new.rider_number))
      order by (p.email ilike '%@timelexx.rider') desc, p.created_at desc
      limit 1;
    end if;
  end if;
  return new;
end;
$function$;

-- 3) Update RPC to use resilient name match
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

  RETURN v_order;
END;
$$;