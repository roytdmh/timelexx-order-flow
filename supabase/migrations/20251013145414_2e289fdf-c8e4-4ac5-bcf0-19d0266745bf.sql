-- Update orders table to include more tracking fields
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS estimated_ready_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rider_accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_notified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rider_notified BOOLEAN DEFAULT false;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_order', 'order_confirmed', 'order_ready', 'rider_assigned')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.notify_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify admin on new order (placed status)
  IF NEW.status = 'placed' OR (NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status != 'pending')) THEN
    INSERT INTO public.notifications (user_id, order_id, type, title, message)
    SELECT ur.user_id, NEW.id, 'new_order', 'New Order Received', 
           'Order #' || LEFT(NEW.id::text, 8) || ' has been placed'
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
    
    -- Notify rider if delivery order
    IF NEW.order_type = 'delivery' AND NEW.assigned_rider_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, order_id, type, title, message)
      VALUES (NEW.assigned_rider_id, NEW.id, 'new_order', 'New Delivery Order', 
              'You have been assigned a new delivery order');
    END IF;
  END IF;
  
  -- Notify customer when order is confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    IF NEW.customer_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, order_id, type, title, message)
      VALUES (NEW.customer_user_id, NEW.id, 'order_confirmed', 'Order Confirmed', 
              'Your order has been confirmed and will be ready in 30 minutes');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order notifications
DROP TRIGGER IF EXISTS order_notification_trigger ON public.orders;
CREATE TRIGGER order_notification_trigger
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_update();