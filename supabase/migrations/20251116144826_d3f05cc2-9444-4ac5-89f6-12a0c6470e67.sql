-- Add 'awaiting_confirmation' status to orders workflow
-- This status indicates rider has reported delivery but admin needs to verify payment

-- Update the notify_order_update trigger to handle the new status
CREATE OR REPLACE FUNCTION public.notify_order_update()
RETURNS trigger
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

-- Update RLS policies to allow riders to set awaiting_confirmation
-- Drop the existing consolidated policy and recreate with new status
DROP POLICY IF EXISTS "orders_update_consolidated" ON public.orders;

CREATE POLICY "orders_update_consolidated"
ON public.orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role_new) 
  OR ((auth.jwt() ->> 'user_role') = 'admin')
  OR (
    has_role(auth.uid(), 'rider'::app_role_new) 
    AND order_type = 'delivery' 
    AND assigned_rider_id = auth.uid()
    AND status IN ('pending', 'confirmed', 'preparing')
  )
  OR can_update_order_for_dashboard_user(orders.*, orders.*)
  OR (
    ((auth.jwt() ->> 'user_role') = 'rider') 
    AND assigned_rider_id = current_auth_uid() 
    AND status IN ('pending', 'confirmed', 'preparing')
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role_new)
  OR (
    has_role(auth.uid(), 'rider'::app_role_new) 
    AND order_type = 'delivery'
    AND assigned_rider_id = auth.uid()
    AND status = 'awaiting_confirmation'
  )
  OR can_update_order_for_dashboard_user(orders.*, orders.*)
  OR (
    ((auth.jwt() ->> 'user_role') = 'rider') 
    AND assigned_rider_id = current_auth_uid() 
    AND status = 'awaiting_confirmation'
  )
);

-- Update the log_order_updates function to handle awaiting_confirmation status
CREATE OR REPLACE FUNCTION public.log_order_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  changed_fields JSONB := '{}'::jsonb;
  change_description TEXT := '';
BEGIN
  -- Track what changed
  IF OLD.status != NEW.status THEN
    changed_fields := jsonb_set(changed_fields, '{status}', to_jsonb(NEW.status));
    change_description := 'Status changed from ' || OLD.status || ' to ' || NEW.status;
    
    -- Log financial transaction for rider reporting delivery
    IF NEW.status = 'awaiting_confirmation' THEN
      INSERT INTO public.financial_transactions (
        order_id,
        transaction_type,
        amount,
        payment_method,
        previous_status,
        new_status,
        recorded_by,
        notes
      ) VALUES (
        NEW.id,
        'payment_verified',
        NEW.total,
        NEW.payment_method,
        OLD.status,
        NEW.status,
        auth.uid(),
        'Rider reported delivery complete - awaiting admin verification'
      );
    END IF;
    
    -- Log financial transaction for admin confirming delivery
    IF NEW.status = 'delivered' AND OLD.status = 'awaiting_confirmation' THEN
      INSERT INTO public.financial_transactions (
        order_id,
        transaction_type,
        amount,
        payment_method,
        previous_status,
        new_status,
        recorded_by,
        notes
      ) VALUES (
        NEW.id,
        'payment_received',
        NEW.total,
        NEW.payment_method,
        OLD.status,
        NEW.status,
        auth.uid(),
        'Admin verified delivery and payment - order complete'
      );
    END IF;
    
    -- Log financial transaction for direct delivery (not from awaiting_confirmation)
    IF NEW.status = 'delivered' AND OLD.status != 'awaiting_confirmation' THEN
      INSERT INTO public.financial_transactions (
        order_id,
        transaction_type,
        amount,
        payment_method,
        previous_status,
        new_status,
        recorded_by,
        notes
      ) VALUES (
        NEW.id,
        'payment_received',
        NEW.total,
        NEW.payment_method,
        OLD.status,
        NEW.status,
        auth.uid(),
        'Order delivered - payment received'
      );
    END IF;
  END IF;

  IF OLD.payment_method IS DISTINCT FROM NEW.payment_method THEN
    changed_fields := jsonb_set(changed_fields, '{payment_method}', to_jsonb(NEW.payment_method));
    
    INSERT INTO public.financial_transactions (
      order_id,
      transaction_type,
      amount,
      payment_method,
      previous_status,
      new_status,
      recorded_by,
      notes
    ) VALUES (
      NEW.id,
      'payment_verified',
      NEW.total,
      NEW.payment_method,
      OLD.status,
      NEW.status,
      auth.uid(),
      'Payment method updated from ' || COALESCE(OLD.payment_method, 'none') || ' to ' || COALESCE(NEW.payment_method, 'none')
    );
  END IF;

  IF OLD.total != NEW.total THEN
    changed_fields := jsonb_set(changed_fields, '{total}', to_jsonb(NEW.total));
    
    INSERT INTO public.financial_transactions (
      order_id,
      transaction_type,
      amount,
      payment_method,
      recorded_by,
      notes,
      metadata
    ) VALUES (
      NEW.id,
      'adjustment',
      NEW.total - OLD.total,
      NEW.payment_method,
      auth.uid(),
      'Order total adjusted',
      jsonb_build_object('old_total', OLD.total, 'new_total', NEW.total)
    );
  END IF;

  IF OLD.assigned_rider_id IS DISTINCT FROM NEW.assigned_rider_id THEN
    changed_fields := jsonb_set(changed_fields, '{assigned_rider_id}', to_jsonb(NEW.assigned_rider_id));
    change_description := change_description || ' Rider assigned';
  END IF;

  -- Only log if something actually changed
  IF jsonb_object_keys(changed_fields) IS NOT NULL THEN
    INSERT INTO public.order_history (
      order_id,
      changed_by,
      change_type,
      old_values,
      new_values
    ) VALUES (
      NEW.id,
      auth.uid(),
      CASE 
        WHEN OLD.status != NEW.status THEN 'status_updated'
        WHEN OLD.payment_method IS DISTINCT FROM NEW.payment_method THEN 'payment_updated'
        WHEN OLD.assigned_rider_id IS DISTINCT FROM NEW.assigned_rider_id THEN 'rider_assigned'
        ELSE 'order_updated'
      END,
      jsonb_build_object(
        'status', OLD.status,
        'payment_method', OLD.payment_method,
        'total', OLD.total,
        'assigned_rider_id', OLD.assigned_rider_id
      ),
      jsonb_build_object(
        'status', NEW.status,
        'payment_method', NEW.payment_method,
        'total', NEW.total,
        'assigned_rider_id', NEW.assigned_rider_id
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;