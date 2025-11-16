-- Cleanup Script: Remove duplicate profiles and backfill assigned_rider_id
-- Run this script manually in Supabase SQL Editor before the migration

-- Step 1: Identify and keep the oldest profile for each duplicate name
-- Delete duplicate Awaga profile (keep the older one from October 2025)
DELETE FROM profiles 
WHERE user_id = '543c620d-d78c-4cfb-bac8-ed49cfad91cc' 
  AND full_name = 'Awaga';

-- Step 2: Check for other duplicates and clean them up
-- You may need to adjust this based on which profiles are actively used
-- Run this query first to see all duplicates:
-- SELECT full_name, COUNT(*), STRING_AGG(user_id::text, ', '), STRING_AGG(email, ', ')
-- FROM profiles WHERE full_name IS NOT NULL GROUP BY full_name HAVING COUNT(*) > 1;

-- Delete duplicate Roy profiles if any (keep the one actively used by riders)
-- Uncomment and adjust user_id after checking which one to keep:
-- DELETE FROM profiles WHERE user_id = 'REPLACE_WITH_DUPLICATE_USER_ID' AND full_name = 'Roy';

-- Step 3: Backfill assigned_rider_id for existing orders
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

-- Step 4: Verify the cleanup
SELECT 'Duplicate check' as check_type, full_name, COUNT(*) as count
FROM profiles 
WHERE full_name IS NOT NULL
GROUP BY full_name 
HAVING COUNT(*) > 1

UNION ALL

SELECT 'Backfill check' as check_type, 
       'Orders missing assigned_rider_id' as full_name,
       COUNT(*)::integer as count
FROM orders 
WHERE order_type = 'delivery' 
  AND rider_number IS NOT NULL 
  AND assigned_rider_id IS NULL;
