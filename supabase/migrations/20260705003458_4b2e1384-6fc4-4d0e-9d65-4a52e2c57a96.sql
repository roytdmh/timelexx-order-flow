CREATE OR REPLACE FUNCTION public.get_requester_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  _role text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN 'anon';
  END IF;

  SELECT role::text INTO _role
  FROM public.user_roles
  WHERE user_id = (SELECT auth.uid())
  ORDER BY CASE role::text WHEN 'admin' THEN 1 WHEN 'rider' THEN 2 ELSE 3 END
  LIMIT 1;

  RETURN COALESCE(_role, 'user');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_requester_user_role() TO authenticated;