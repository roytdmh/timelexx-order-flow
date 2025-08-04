-- Remove all items except the ones to keep
DELETE FROM menu_items 
WHERE name NOT IN ('Beef Shawarma', 'Chicken Shawarma', 'Chicken & Beef Shawarma', 'Loaded Fries', 'Coke', 'Water');

-- Add the new items
INSERT INTO menu_items (name, price, icon, category, description) VALUES
('Jollof & Chicken', 70, '🍗', 'Mains', 'Jollof rice with chicken'),
('Assorted Jollof', 80, '🍚', 'Mains', 'Jollof rice with assorted proteins'),
('Assorted Noodles', 70, '🍜', 'Mains', 'Noodles with assorted proteins');