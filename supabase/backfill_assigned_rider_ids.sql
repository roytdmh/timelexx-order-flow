-- Optional: Backfill assigned_rider_id for existing orders
-- Run this if you have existing orders with rider_number but no assigned_rider_id

UPDATE orders
SET assigned_rider_id = (
  SELECT user_id 
  FROM profiles 
  WHERE profiles.full_name = orders.rider_number
  LIMIT 1
)
WHERE 
  rider_number IS NOT NULL 
  AND assigned_rider_id IS NULL
  AND order_type = 'delivery';
