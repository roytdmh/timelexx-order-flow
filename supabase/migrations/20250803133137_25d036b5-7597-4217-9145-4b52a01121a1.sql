-- Fix RLS for existing tables that don't have it enabled
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for existing tables (restricting access since they're not part of this app)
CREATE POLICY "No access to budgets" ON public.budgets FOR ALL USING (false);
CREATE POLICY "No access to financial_health_scores" ON public.financial_health_scores FOR ALL USING (false);
CREATE POLICY "No access to price_data" ON public.price_data FOR ALL USING (false);
CREATE POLICY "No access to exchange_rates" ON public.exchange_rates FOR ALL USING (false);
CREATE POLICY "No access to chat_sessions" ON public.chat_sessions FOR ALL USING (false);

-- Fix the search path for the existing function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';