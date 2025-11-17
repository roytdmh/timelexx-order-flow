-- Patch: allow trigger to insert notifications by marking context as 'system'
-- This avoids RLS failures during rider -> awaiting_confirmation updates

CREATE OR REPLACE FUNCTION public.notify_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure RLS policies that require a system context pass inside this trigger
  PERFORM set_config('request.jwt.claim.role', 'system', true);

  -- Notify admin on new order (placed status)
  IF NEW.status = 'placed' OR (NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status != 'pending')) THEN
    -- Notify admins
    INSERT INTO public.notifications (user_id, order_id, type, title, message)
    SELECT ur.user_id, NEW.id, 'new_order', 'New Order Received', 
           'Order #' || LEFT(NEW.id::text, 8) || ' has been placed'
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
    
    -- Notify assigned rider if delivery order
    IF NEW.order_type = 'delivery' AND NEW.rider_number IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, order_id, type, title, message)
      SELECT p.user_id, NEW.id, 'new_order', 'New Delivery Assignment', 
             'You have been assigned delivery order #' || LEFT(NEW.id::text, 8)
      FROM public.profiles p
      WHERE p.full_name = NEW.rider_number;
    END IF;
  END IF;
  
  -- Notify admin when rider reports delivery complete (awaiting confirmation)
  IF NEW.status = 'awaiting_confirmation' AND (OLD.status IS NULL OR OLD.status != 'awaiting_confirmation') THEN
    INSERT INTO public.notifications (user_id, order_id, type, title, message)
    SELECT ur.user_id, NEW.id, 'order_confirmed', 'Delivery Needs Verification', 
           'Rider ' || COALESCE(NEW.rider_number, 'unknown') || ' reports delivery complete for order #' || LEFT(NEW.id::text, 8) || '. Payment: ' || COALESCE(NEW.payment_method, 'Not specified') || '. Please verify and confirm.'
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;
  
  -- Notify customer when order is confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    IF NEW.customer_user_id IS NOT NULL THEN
      DECLARE
        message_text TEXT;
      BEGIN
        IF NEW.order_type = 'delivery' AND NEW.rider_number IS NOT NULL THEN
          message_text := 'Your order has been confirmed and will be ready in 30 minutes. Rider: ' || NEW.rider_number;
        ELSE
          message_text := 'Your order has been confirmed and will be ready in 30 minutes';
        END IF;
        
        INSERT INTO public.notifications (user_id, order_id, type, title, message)
        VALUES (NEW.customer_user_id, NEW.id, 'order_confirmed', 'Order Confirmed', message_text);
      END;
    END IF;
    
    -- Notify admin that order was confirmed
    IF OLD.status = 'placed' THEN
      INSERT INTO public.notifications (user_id, order_id, type, title, message)
      SELECT ur.user_id, NEW.id, 'order_confirmed', 'Order Confirmed', 
             'Order #' || LEFT(NEW.id::text, 8) || ' has been confirmed'
      FROM public.user_roles ur
      WHERE ur.role = 'admin';
    END IF;
  END IF;
  
  -- Notify customer and admin when order is finally delivered (after admin verification)
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Notify customer
    IF NEW.customer_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, order_id, type, title, message)
      VALUES (
        NEW.customer_user_id, 
        NEW.id, 
        'order_confirmed', 
        'Order Delivered', 
        'Your order #' || LEFT(NEW.id::text, 8) || ' has been delivered successfully'
      );
    END IF;
    
    -- Notify admins (only if coming from awaiting_confirmation, not from direct admin delivery)
    IF OLD.status = 'awaiting_confirmation' THEN
      INSERT INTO public.notifications (user_id, order_id, type, title, message)
      SELECT 
        ur.user_id, 
        NEW.id, 
        'order_confirmed', 
        'Delivery Confirmed', 
        'Order #' || LEFT(NEW.id::text, 8) || ' delivery verified and confirmed. Payment: ' || COALESCE(NEW.payment_method, 'Not specified')
      FROM public.user_roles ur
      WHERE ur.role = 'admin';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;