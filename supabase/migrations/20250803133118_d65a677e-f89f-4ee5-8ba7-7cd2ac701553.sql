-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Mains', 'Drinks', 'Sides')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total NUMERIC NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  rider_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'cancelled')) DEFAULT 'pending',
  customer_name TEXT,
  customer_number TEXT,
  customer_address TEXT,
  customer_coordinates JSONB,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'MoMo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table (junction table for orders and menu items)
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu items (public read access)
CREATE POLICY "Menu items are viewable by everyone" 
ON public.menu_items 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage menu items" 
ON public.menu_items 
FOR ALL 
USING (false);

-- Create policies for orders (public access for restaurant staff)
CREATE POLICY "Orders are viewable by everyone" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Orders can be created by everyone" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders can be updated by everyone" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Create policies for order items (public access for restaurant staff)
CREATE POLICY "Order items are viewable by everyone" 
ON public.order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Order items can be created by everyone" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert current menu items
INSERT INTO public.menu_items (name, price, icon, category, description) VALUES
('Crispy Chicken', 65, '🍗', 'Mains', 'Crispy fried chicken'),
('Crispy Chicken & Chips', 90, '🍗', 'Mains', 'Crispy chicken with chips'),
('Beef Shawarma', 60, '🌯', 'Mains', 'Beef shawarma wrap'),
('Chicken Shawarma', 60, '🌯', 'Mains', 'Chicken shawarma wrap'),
('Chicken & Beef Shawarma', 70, '🌯', 'Mains', 'Mixed meat shawarma wrap'),
('Loaded Fries', 100, '🍟', 'Mains', 'Fries with toppings'),
('Coke', 10, '🥤', 'Drinks', 'Coca Cola'),
('Pepsi', 10, '🥤', 'Drinks', 'Pepsi Cola'),
('Orange Fanta', 10, '🥤', 'Drinks', 'Orange flavored soda'),
('Sprite', 10, '🥤', 'Drinks', 'Lemon-lime soda'),
('Diet Coke', 10, '🥤', 'Drinks', 'Diet Coca Cola'),
('Apple Juice', 15, '🧃', 'Drinks', 'Fresh apple juice'),
('Orange Juice', 15, '🧃', 'Drinks', 'Fresh orange juice'),
('Iced Tea', 12, '🧊', 'Drinks', 'Cold iced tea'),
('Coffee', 20, '☕', 'Drinks', 'Hot coffee'),
('Hot Tea', 15, '🍵', 'Drinks', 'Hot tea'),
('Smoothie', 25, '🥤', 'Drinks', 'Fruit smoothie'),
('Energy Drink', 18, '⚡', 'Drinks', 'Energy drink'),
('Milkshake', 30, '🥤', 'Drinks', 'Creamy milkshake'),
('Coconut Water', 12, '🥥', 'Drinks', 'Fresh coconut water'),
('Water', 5, '💧', 'Drinks', 'Bottled water');