-- Fix repair data and device quantities for Facility 4
-- This script will:
-- 1. Reset device quantities to correct values
-- 2. Update device item statuses based on current repair status

-- First, let's see the current state
SELECT '=== CURRENT STATE ===' as info;

SELECT
  fd.device_type,
  fd.qty_total,
  fd.qty_available,
  fd.qty_broken,
  fd.qty_rented,
  (fd.qty_available + fd.qty_broken + fd.qty_rented) as calculated_total
FROM facility_devices fd
WHERE fd.facility_id = 4;

SELECT
  r.id as repair_id,
  r.status as repair_status,
  di.id as device_item_id,
  di.device_code,
  di.status as device_item_status,
  fd.device_type
FROM facility_repairs r
LEFT JOIN facility_device_items di ON r.device_item_id = di.id
LEFT JOIN facility_devices fd ON di.facility_device_id = fd.id
WHERE r.facility_id = 4
ORDER BY r.id;

-- Fix strategy:
-- 1. For each device type, recalculate quantities based on actual device item statuses
-- 2. Update repair records to match device item statuses

-- Step 1: Recalculate device quantities for '골전도 이어폰'
UPDATE facility_devices fd
SET
  fd.qty_available = (
    SELECT COUNT(*)
    FROM facility_device_items di
    WHERE di.facility_device_id = fd.id AND di.status = 'available'
  ),
  fd.qty_broken = (
    SELECT COUNT(*)
    FROM facility_device_items di
    WHERE di.facility_device_id = fd.id AND di.status = 'broken'
  ),
  fd.qty_rented = (
    SELECT COUNT(*)
    FROM facility_device_items di
    WHERE di.facility_device_id = fd.id AND di.status = 'rented'
  )
WHERE fd.facility_id = 4 AND fd.device_type = '골전도 이어폰';

-- Step 2: Recalculate device quantities for 'AR글라스'
UPDATE facility_devices fd
SET
  fd.qty_available = (
    SELECT COUNT(*)
    FROM facility_device_items di
    WHERE di.facility_device_id = fd.id AND di.status = 'available'
  ),
  fd.qty_broken = (
    SELECT COUNT(*)
    FROM facility_device_items di
    WHERE di.facility_device_id = fd.id AND di.status = 'broken'
  ),
  fd.qty_rented = (
    SELECT COUNT(*)
    FROM facility_device_items di
    WHERE di.facility_device_id = fd.id AND di.status = 'rented'
  )
WHERE fd.facility_id = 4 AND fd.device_type = 'AR글라스';

-- Step 3: Verify results
SELECT '=== AFTER FIX ===' as info;

SELECT
  fd.device_type,
  fd.qty_total,
  fd.qty_available,
  fd.qty_broken,
  fd.qty_rented,
  (fd.qty_available + fd.qty_broken + fd.qty_rented) as calculated_total
FROM facility_devices fd
WHERE fd.facility_id = 4;
