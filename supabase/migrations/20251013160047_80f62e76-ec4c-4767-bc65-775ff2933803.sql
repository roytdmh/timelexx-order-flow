-- Create master admin account for authentication
-- This account is used by all admin users who sign in with the access code

-- First check if admin@timelexx.admin profile exists, if not create it
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Try to find existing admin profile
  SELECT user_id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'admin@timelexx.admin'
  LIMIT 1;
  
  -- If no admin profile found, we need to create a placeholder
  -- Note: The actual auth.users entry must be created via Supabase Auth API
  -- This migration only ensures the profile and role are set up
  IF admin_user_id IS NULL THEN
    -- Create a placeholder profile that will be linked when the auth user is created
    -- You'll need to create the auth user manually via Supabase dashboard or signup
    RAISE NOTICE 'No master admin account found. Please create auth user: admin@timelexx.admin with password: TimelexxInn00233';
  ELSE
    -- Ensure the admin role exists for this user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role_new)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Master admin account role verified';
  END IF;
END $$;