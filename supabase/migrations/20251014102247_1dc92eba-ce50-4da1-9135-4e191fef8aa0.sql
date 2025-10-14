-- Update the notify_order_update function to handle delivery notifications
CREATE OR REPLACE FUNCTION public.notify_order_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
  
  -- Notify customer when order is confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    IF NEW.customer_user_id IS NOT NULL THEN
      -- Build message with rider info if available
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
  
  -- Notify customer and admin when order is delivered
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
    
    -- Notify admins
    INSERT INTO public.notifications (user_id, order_id, type, title, message)
    SELECT 
      ur.user_id, 
      NEW.id, 
      'order_confirmed', 
      'Order Delivered', 
      'Order #' || LEFT(NEW.id::text, 8) || ' was delivered by ' || COALESCE(NEW.rider_number, 'rider') || '. Payment: ' || COALESCE(NEW.payment_method, 'Not specified')
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$function$;