-- Fix the get_requester_user_role function to use correct table
-- This function was looking for user_profiles table which doesn't exist
-- The correct table is user_roles

CREATE OR REPLACE FUNCTION public.get_requester_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  _role text;
  _jwt jsonb;
BEGIN
  -- Try JWT claim first
  _jwt := auth.jwt();
  IF _jwt IS NOT NULL THEN
    _role := (_jwt ->> 'user_role');
    IF _role IS NOT NULL AND _role <> '' THEN
      RETURN _role;
    END IF;
  END IF;

  -- Fallback to user_roles table lookup (FIXED: was looking for user_profiles)
  IF (SELECT auth.uid()) IS NOT NULL THEN
    SELECT role::text INTO _role 
    FROM public.user_roles 
    WHERE user_id = (SELECT auth.uid()) 
    LIMIT 1;
    
    IF _role IS NOT NULL THEN
      RETURN _role;
    END IF;
  END IF;

  -- Final default
  RETURN 'user';
END;
$function$;