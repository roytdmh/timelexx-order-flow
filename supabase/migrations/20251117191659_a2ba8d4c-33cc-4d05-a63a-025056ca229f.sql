-- Fix rider update flow: relax RLS to allow rider updates when their profile name matches rider_number, and add trigger to auto-set assigned_rider_id

-- 1) Replace consolidated UPDATE policy on orders
DROP POLICY IF EXISTS orders_update_consolidated ON public.orders;

CREATE POLICY orders_update_consolidated
ON public.orders
FOR UPDATE
USING (
  -- Admins can update anything
  public.has_role(auth.uid(), 'admin'::public.app_role_new)
  OR (
    -- Riders can update delivery orders in progress, even if assigned_rider_id is wrong,
    -- as long as their profile name matches rider_number OR they are the assigned rider
    public.has_role(auth.uid(), 'rider'::public.app_role_new)
    AND order_type = 'delivery'
    AND (
      assigned_rider_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.full_name = orders.rider_number
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
        WHERE p.user_id = auth.uid() AND p.full_name = orders.rider_number
      )
    )
    AND status = 'awaiting_confirmation'
  )
);

-- 2) Ensure assigned_rider_id is auto-populated from rider_number on insert and update
DROP TRIGGER IF EXISTS trg_orders_set_assigned_rider ON public.orders;
CREATE TRIGGER trg_orders_set_assigned_rider
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_assigned_rider_id_from_name();