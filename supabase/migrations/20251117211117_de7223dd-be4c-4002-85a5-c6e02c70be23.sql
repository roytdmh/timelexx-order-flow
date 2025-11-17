-- Fix: jsonb_object_length doesn't exist in PostgreSQL
-- Use changed_fields != '{}'::jsonb instead

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

  -- Only log if something actually changed (check if not empty object)
  IF changed_fields != '{}'::jsonb THEN
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