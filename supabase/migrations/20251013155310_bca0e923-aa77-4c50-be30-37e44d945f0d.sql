-- Fix existing users without roles
-- Assign customer role to users with @timelexx.customer email who don't have roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'customer'::app_role_new
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email LIKE '%@timelexx.customer' 
  AND ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign admin role to users with @timelexx.admin email who don't have roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role_new
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email LIKE '%@timelexx.admin' 
  AND ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign rider role to users with @timelexx.com email who don't have roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'rider'::app_role_new
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email LIKE '%@timelexx.com' 
  AND ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;