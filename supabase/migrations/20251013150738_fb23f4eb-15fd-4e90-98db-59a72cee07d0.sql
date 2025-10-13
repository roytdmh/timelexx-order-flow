-- Update RLS policy for notifications to allow system to create notifications for riders
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "System can create notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (
  -- Allow if the authenticated user is creating a notification for themselves
  auth.uid() = user_id 
  OR 
  -- Allow if the user is an admin creating notifications
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR
  -- Allow database functions (via triggers) to create notifications
  current_setting('role') = 'postgres'
);