-- Remove specific items and all Sides category items
DELETE FROM menu_items 
WHERE name IN ('Assorted Noodles', 'Assorted Jollof', 'Assorted Jollof Rice') 
   OR category = 'Sides';