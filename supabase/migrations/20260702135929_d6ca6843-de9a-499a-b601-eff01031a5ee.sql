
-- 1. user_roles: restrict self-insert to customer role only
DROP POLICY IF EXISTS "Users can insert their own roles on signup" ON public.user_roles;
CREATE POLICY "Users can self-assign customer role on signup"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND role = 'customer'::app_role_new);

-- 2. notifications: replace spoofable JWT-claim check with trigger-depth check
DROP POLICY IF EXISTS "System can create notifications for any user" ON public.notifications;
CREATE POLICY "Users or triggers can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    ((SELECT auth.uid()) = user_id)
    OR pg_trigger_depth() > 0
  );

-- 3. Revoke anon SELECT on all sensitive tables (keep menu_items readable for public menu)
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.activity_logs FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.admin_sessions FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.budgets FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.daily_resets FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.exchange_rates FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.financial_health_scores FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.notifications FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.order_history FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.order_items FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.price_data FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.user_roles FROM anon;

-- 4. Revoke EXECUTE on SECURITY DEFINER functions from anon/public;
--    keep authenticated execute only where the client (or RLS) calls them.
REVOKE EXECUTE ON FUNCTION public.admin_confirm_delivery(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rider_report_delivery(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_all_orders() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_todays_orders() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_order_statistics() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_requester_user_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role_new) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_update_order_for_dashboard_user(public.orders, public.orders) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_auth_uid() FROM PUBLIC, anon, authenticated;

-- Trigger-only functions: revoke from everyone (triggers run as table owner)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.end_previous_admin_sessions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_order_creation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_order_updates() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_order_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_assigned_rider_id_from_name() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 5. storage.objects RLS policies for private 'timelexxinn' bucket (admin-only)
DROP POLICY IF EXISTS "Admins manage timelexxinn bucket" ON storage.objects;
CREATE POLICY "Admins manage timelexxinn bucket"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'timelexxinn' AND public.has_role(auth.uid(), 'admin'::public.app_role_new))
  WITH CHECK (bucket_id = 'timelexxinn' AND public.has_role(auth.uid(), 'admin'::public.app_role_new));
