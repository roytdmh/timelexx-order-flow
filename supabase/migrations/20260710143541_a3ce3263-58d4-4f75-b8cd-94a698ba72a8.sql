
CREATE OR REPLACE FUNCTION public.assign_staff_role(_role public.app_role_new, _code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _code IS NULL OR _code <> 'JanysCuisine00233' THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  IF _role NOT IN ('admin'::public.app_role_new, 'rider'::public.app_role_new) THEN
    RAISE EXCEPTION 'Role not allowed';
  END IF;

  INSERT INTO public.user_roles(user_id, role)
  VALUES (_uid, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_staff_role(public.app_role_new, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_staff_role(public.app_role_new, text) TO authenticated;

-- Backfill missing rider role for existing rider auth accounts (@timelexx.rider)
INSERT INTO public.user_roles(user_id, role)
SELECT p.user_id, 'rider'::public.app_role_new
FROM public.profiles p
WHERE p.email LIKE '%@timelexx.rider'
ON CONFLICT (user_id, role) DO NOTHING;

-- Backfill missing admin role for existing admin auth accounts (@timelexx.admin)
INSERT INTO public.user_roles(user_id, role)
SELECT p.user_id, 'admin'::public.app_role_new
FROM public.profiles p
WHERE p.email LIKE '%@timelexx.admin'
ON CONFLICT (user_id, role) DO NOTHING;
