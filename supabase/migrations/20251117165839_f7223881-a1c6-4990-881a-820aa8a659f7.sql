-- Backfill missing assigned_rider_id for existing delivery orders
-- This matches rider_number (name) to user_id from profiles table

UPDATE orders 
SET assigned_rider_id = profiles.user_id
FROM profiles
WHERE orders.order_type = 'delivery' 
  AND orders.rider_number IS NOT NULL 
  AND orders.assigned_rider_id IS NULL
  AND orders.rider_number = profiles.full_name;