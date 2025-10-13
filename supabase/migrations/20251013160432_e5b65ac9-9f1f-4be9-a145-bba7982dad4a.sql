-- Create master rider account for authentication
-- This account is used by all riders who sign in with the access code

DO $$
DECLARE
  rider_user_id uuid;
BEGIN
  -- Try to find existing rider profile
  SELECT user_id INTO rider_user_id
  FROM public.profiles
  WHERE email = 'rider@timelexx.com'
  LIMIT 1;
  
  -- If no rider profile found, we need to create a placeholder
  -- Note: The actual auth.users entry must be created via Supabase Auth API
  IF rider_user_id IS NULL THEN
    RAISE NOTICE 'No master rider account found. Please create auth user: rider@timelexx.com with password: TimelexxInn00233';
  ELSE
    -- Ensure the rider role exists for this user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (rider_user_id, 'rider'::app_role_new)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Master rider account role verified';
  END IF;
END $$;