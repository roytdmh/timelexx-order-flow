-- ⚠️ CRITICAL: Manual Cleanup Script for Duplicate Profiles
-- Run this in Supabase SQL Editor BEFORE the migration can succeed
-- This addresses duplicate profile errors blocking the uniqueness constraint

-- ============================================================================
-- STEP 1: View all duplicates (for review)
-- ============================================================================
SELECT full_name, COUNT(*) as count, 
       STRING_AGG(user_id::text || ' (' || email || ')', ', ' ORDER BY created_at) as profiles_oldest_first
FROM profiles 
WHERE full_name IS NOT NULL
GROUP BY full_name 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- ============================================================================
-- STEP 2: Delete duplicate profiles (keeping the most appropriate one)
-- ============================================================================

-- Delete duplicate Awaga (keep the older rider@timelexx.com account)
DELETE FROM profiles 
WHERE user_id = '543c620d-d78c-4cfb-bac8-ed49cfad91cc' 
  AND full_name = 'Awaga';

-- Delete 3 of the 4 duplicate Roy profiles (keep roy@timelexx.admin)
DELETE FROM profiles 
WHERE full_name = 'Roy' 
  AND user_id IN (
    'aabb142f-cebd-4ddc-9e8b-1b4dadcd9d4d',
    'f688caf8-5aad-4582-b135-cf45147eebae',
    'c1ea1454-202a-4f2f-a35e-4a096deb96b7'
  );

-- ============================================================================
-- STEP 3: Backfill assigned_rider_id for existing delivery orders
-- ============================================================================
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

-- ============================================================================
-- STEP 4: Verification (should all return 0)
-- ============================================================================

-- Check for remaining duplicates (should be 0)
SELECT 'Remaining duplicates' as check_name, COUNT(*)::integer as count
FROM (
  SELECT full_name
  FROM profiles 
  WHERE full_name IS NOT NULL
  GROUP BY full_name 
  HAVING COUNT(*) > 1
) duplicates

UNION ALL

-- Check for orders missing assigned_rider_id (should be 0)
SELECT 'Orders without assigned_rider_id' as check_name, COUNT(*)::integer as count
FROM orders 
WHERE order_type = 'delivery' 
  AND rider_number IS NOT NULL 
  AND assigned_rider_id IS NULL;
