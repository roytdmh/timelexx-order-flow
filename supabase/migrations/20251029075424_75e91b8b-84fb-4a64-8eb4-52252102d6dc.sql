-- Fix has_role function and all dependent policies
-- Step 1: Drop old function with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS public.has_role(app_role, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role app_role) CASCADE;

-- Step 2: Create the correct has_role function with app_role_new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role_new)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Step 3: Recreate the activity_logs policy that was dropped
CREATE POLICY "Public can view activity logs if admin or owner"
ON public.activity_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role_new) OR (user_id = auth.uid())
);

-- Step 4: Add improved SELECT policy for orders for admin users
DROP POLICY IF EXISTS "Admin users can view all orders" ON public.orders;

CREATE POLICY "Admin users can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role_new)
);