-- Fix orders status check constraint to include all required statuses
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['placed'::text, 'pending'::text, 'confirmed'::text, 'preparing'::text, 'delivered'::text, 'cancelled'::text]));