-- Fix signup failure: profiles table has no "role" column but trigger function inserts it.
-- Update handle_new_user to stop referencing non-existent column and avoid role writes here.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create a basic profile for the user without role (roles are managed in public.user_roles)
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Note: We intentionally do NOT modify triggers on auth.users here.
-- The existing trigger (if present) will now call the corrected function.
