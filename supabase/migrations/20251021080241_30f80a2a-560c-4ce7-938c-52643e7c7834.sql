-- Fix RLS policy to restrict riders to only their assigned orders
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;

CREATE POLICY "Customers can view their own orders" ON public.orders
FOR SELECT USING (
  (has_role(auth.uid(), 'customer'::app_role_new) AND (customer_user_id = auth.uid())) 
  OR has_role(auth.uid(), 'admin'::app_role_new) 
  OR (has_role(auth.uid(), 'rider'::app_role_new) 
      AND (order_type = 'delivery'::text) 
      AND (assigned_rider_id = auth.uid()))
);