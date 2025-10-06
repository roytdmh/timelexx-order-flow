-- Drop existing role column from profiles and recreate role system securely
-- Step 1: Create new enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role_new AS ENUM ('customer', 'admin', 'rider');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create user_roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role_new NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role_new)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Step 4: Update profiles table to store customer location
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Remove old role column if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 5: Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles on signup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Update orders RLS policies for role-based access
DROP POLICY IF EXISTS "Public can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;

-- Customers can only see their own orders
CREATE POLICY "Customers can view their own orders"
  ON public.orders
  FOR SELECT
  USING (
    has_role(auth.uid(), 'customer') AND customer_user_id = auth.uid()
    OR has_role(auth.uid(), 'admin')
    OR (has_role(auth.uid(), 'rider') AND order_type = 'delivery')
  );

-- Customers can create orders
CREATE POLICY "Customers can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'customer') AND customer_user_id = auth.uid()
    OR has_role(auth.uid(), 'admin')
  );

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete orders
CREATE POLICY "Admins can delete orders"
  ON public.orders
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Step 7: Update order_items RLS for customer access
DROP POLICY IF EXISTS "Public can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can delete order items" ON public.order_items;

CREATE POLICY "Users can view order items for their orders"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        (has_role(auth.uid(), 'customer') AND orders.customer_user_id = auth.uid())
        OR has_role(auth.uid(), 'admin')
        OR (has_role(auth.uid(), 'rider') AND orders.order_type = 'delivery')
      )
    )
  );

CREATE POLICY "Users can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        (has_role(auth.uid(), 'customer') AND orders.customer_user_id = auth.uid())
        OR has_role(auth.uid(), 'admin')
      )
    )
  );

CREATE POLICY "Admins can update order items"
  ON public.order_items
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order items"
  ON public.order_items
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));