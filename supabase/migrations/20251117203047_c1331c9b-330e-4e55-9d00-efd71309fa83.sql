-- Fix: allow 'awaiting_confirmation' status in orders_status_check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (
  status = ANY (ARRAY['placed','pending','confirmed','awaiting_confirmation','delivered','cancelled'])
);