-- Drop the restrictive RLS policies on orders table
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Kitchen staff can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Kitchen staff can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Riders can view assigned orders" ON public.orders;

-- Create permissive policies for anonymous users to manage orders
CREATE POLICY "Orders are viewable by everyone" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Orders can be created by everyone" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders can be updated by everyone" 
ON public.orders 
FOR UPDATE 
USING (true);

CREATE POLICY "Orders can be deleted by everyone" 
ON public.orders 
FOR DELETE 
USING (true);