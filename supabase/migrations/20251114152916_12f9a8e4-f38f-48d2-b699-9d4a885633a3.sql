-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM (
  'order_created',
  'payment_received',
  'payment_verified',
  'status_change',
  'refund',
  'adjustment'
);

-- Create financial_transactions table for audit trail
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  previous_status TEXT,
  new_status TEXT,
  recorded_by UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create order_history table for tracking all order changes
CREATE TABLE public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID,
  change_type TEXT NOT NULL,
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on audit tables
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view audit logs
CREATE POLICY "Admins can view financial transactions"
ON public.financial_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role_new));

CREATE POLICY "Admins can view order history"
ON public.order_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role_new));

-- Create indexes for performance
CREATE INDEX idx_financial_transactions_order_id ON public.financial_transactions(order_id);
CREATE INDEX idx_financial_transactions_created_at ON public.financial_transactions(created_at DESC);
CREATE INDEX idx_order_history_order_id ON public.order_history(order_id);
CREATE INDEX idx_order_history_created_at ON public.order_history(created_at DESC);

-- Function to log order creation
CREATE OR REPLACE FUNCTION public.log_order_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log order creation in history
  INSERT INTO public.order_history (
    order_id,
    changed_by,
    change_type,
    new_values
  ) VALUES (
    NEW.id,
    NEW.customer_user_id,
    'order_created',
    jsonb_build_object(
      'order_type', NEW.order_type,
      'total', NEW.total,
      'status', NEW.status,
      'customer_name', NEW.customer_name,
      'customer_number', NEW.customer_number,
      'payment_method', NEW.payment_method
    )
  );

  -- Log initial financial transaction
  INSERT INTO public.financial_transactions (
    order_id,
    transaction_type,
    amount,
    payment_method,
    new_status,
    recorded_by,
    notes
  ) VALUES (
    NEW.id,
    'order_created',
    NEW.total,
    NEW.payment_method,
    NEW.status,
    NEW.customer_user_id,
    'Order placed'
  );

  RETURN NEW;
END;
$$;

-- Function to log order updates
CREATE OR REPLACE FUNCTION public.log_order_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields JSONB := '{}'::jsonb;
  change_description TEXT := '';
BEGIN
  -- Track what changed
  IF OLD.status != NEW.status THEN
    changed_fields := jsonb_set(changed_fields, '{status}', to_jsonb(NEW.status));
    change_description := 'Status changed from ' || OLD.status || ' to ' || NEW.status;
    
    -- Log financial transaction for status changes that affect revenue
    IF NEW.status = 'delivered' THEN
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
$$;

-- Create triggers
CREATE TRIGGER audit_order_creation
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_creation();

CREATE TRIGGER audit_order_updates
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_updates();

-- Add comment for documentation
COMMENT ON TABLE public.financial_transactions IS 'Audit trail for all financial transactions related to orders';
COMMENT ON TABLE public.order_history IS 'Complete history of all changes made to orders';
COMMENT ON FUNCTION public.log_order_creation() IS 'Automatically logs order creation to audit tables';
COMMENT ON FUNCTION public.log_order_updates() IS 'Automatically logs order updates to audit tables';