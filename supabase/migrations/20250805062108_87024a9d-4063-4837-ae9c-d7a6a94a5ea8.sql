-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('timelexx_kitchen', 'customer_hub', 'timelexx_riders');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  role app_role NOT NULL DEFAULT 'customer_hub',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role app_role, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = required_role AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer_hub')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only kitchen staff can view all logs, others can view their own
CREATE POLICY "Kitchen staff can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (public.has_role('timelexx_kitchen'));

CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Activity logs can be created by authenticated users" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update existing orders table to include assignment for riders
ALTER TABLE public.orders 
ADD COLUMN assigned_rider_id UUID REFERENCES auth.users(id),
ADD COLUMN customer_user_id UUID REFERENCES auth.users(id);

-- Update orders RLS policies for role-based access
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;
DROP POLICY IF EXISTS "Orders can be created by everyone" ON public.orders;
DROP POLICY IF EXISTS "Orders can be updated by everyone" ON public.orders;

-- Kitchen staff can see all orders
CREATE POLICY "Kitchen staff can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.has_role('timelexx_kitchen'));

-- Customers can see their own orders
CREATE POLICY "Customers can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = customer_user_id OR public.has_role('customer_hub'));

-- Riders can see orders assigned to them
CREATE POLICY "Riders can view assigned orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = assigned_rider_id OR public.has_role('timelexx_riders'));

-- Kitchen staff can create and update orders
CREATE POLICY "Kitchen staff can manage orders" 
ON public.orders 
FOR ALL
USING (public.has_role('timelexx_kitchen'));

-- Customers can create orders
CREATE POLICY "Customers can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (public.has_role('customer_hub') AND auth.uid() = customer_user_id);

-- Riders can update order status and payment method for assigned orders
CREATE POLICY "Riders can update assigned orders" 
ON public.orders 
FOR UPDATE 
USING (public.has_role('timelexx_riders') AND auth.uid() = assigned_rider_id);

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();