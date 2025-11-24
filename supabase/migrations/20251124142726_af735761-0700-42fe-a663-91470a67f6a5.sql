-- Create daily_resets table to track reset timestamps
CREATE TABLE IF NOT EXISTS public.daily_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_at timestamptz NOT NULL DEFAULT now(),
  reset_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_resets ENABLE ROW LEVEL SECURITY;

-- Allow admins to view resets
CREATE POLICY "Admins can view daily resets"
  ON public.daily_resets
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role_new));

-- Allow system/admins to insert resets (called from reset function)
CREATE POLICY "Admins can insert daily resets"
  ON public.daily_resets
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role_new));

-- Update reset_todays_orders to record reset timestamp
CREATE OR REPLACE FUNCTION public.reset_todays_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Record the reset timestamp
  INSERT INTO public.daily_resets (reset_by, reset_at)
  VALUES (auth.uid(), now());
END;
$$;

-- Drop and recreate rider_report_delivery to REQUIRE payment_method (riders only)
DROP FUNCTION IF EXISTS public.rider_report_delivery(uuid, text);

CREATE FUNCTION public.rider_report_delivery(order_id uuid, payment_method text)
RETURNS SETOF orders
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

  -- CRITICAL: Require payment_method for riders
  IF payment_method IS NULL OR payment_method = '' THEN
    RAISE EXCEPTION 'Payment method is required';
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

  -- Return the updated row directly via RETURN QUERY
  RETURN QUERY
  UPDATE public.orders
  SET status = 'awaiting_confirmation',
      payment_method = rider_report_delivery.payment_method,
      assigned_rider_id = auth.uid(),
      updated_at = now()
  WHERE id = rider_report_delivery.order_id
  RETURNING *;
END;
$$;