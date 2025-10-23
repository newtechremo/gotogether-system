-- Fix orphaned rented devices
-- Find devices with status='rented' but no active rental record
-- and change them to status='available'

USE gotogether;

SELECT '========================================' as '';
SELECT 'Step 1: Find orphaned rented devices' as '';
SELECT '========================================' as '';

-- Find devices that are marked as 'rented' but not in any active rental
SELECT
    fdi.id,
    fdi.facility_id,
    fdi.device_type,
    fdi.device_code,
    fdi.status,
    fdi.notes
FROM facility_device_items fdi
WHERE fdi.status = 'rented'
  AND fdi.id NOT IN (
    -- Get all device IDs that are in active rentals
    SELECT DISTINCT frd.device_item_id
    FROM facility_rental_devices frd
    INNER JOIN facility_rentals fr ON frd.rental_id = fr.id
    WHERE fr.status IN ('대여중', '연체')
      AND frd.device_item_id IS NOT NULL
  )
ORDER BY fdi.device_type, fdi.device_code;

-- Count orphaned devices
SELECT
    device_type,
    COUNT(*) as orphaned_count
FROM facility_device_items fdi
WHERE fdi.status = 'rented'
  AND fdi.id NOT IN (
    SELECT DISTINCT frd.device_item_id
    FROM facility_rental_devices frd
    INNER JOIN facility_rentals fr ON frd.rental_id = fr.id
    WHERE fr.status IN ('대여중', '연체')
      AND frd.device_item_id IS NOT NULL
  )
GROUP BY device_type
ORDER BY device_type;

SELECT '========================================' as '';
SELECT 'Step 2: Update orphaned devices to available' as '';
SELECT '========================================' as '';

-- Update orphaned rented devices to available
UPDATE facility_device_items fdi
SET
    status = 'available',
    updated_at = CURRENT_TIMESTAMP
WHERE fdi.status = 'rented'
  AND fdi.id NOT IN (
    SELECT DISTINCT frd.device_item_id
    FROM facility_rental_devices frd
    INNER JOIN facility_rentals fr ON frd.rental_id = fr.id
    WHERE fr.status IN ('대여중', '연체')
      AND frd.device_item_id IS NOT NULL
  );

SELECT CONCAT('Updated ', ROW_COUNT(), ' devices from rented to available') as 'Result';

SELECT '========================================' as '';
SELECT 'Step 3: Verify current status' as '';
SELECT '========================================' as '';

-- Check current device status by type
SELECT
    device_type,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
    SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
    SUM(CASE WHEN status = 'broken' THEN 1 ELSE 0 END) as broken,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
FROM facility_device_items
WHERE facility_id = 1
GROUP BY device_type
ORDER BY device_type;

SELECT '========================================' as '';
SELECT 'Step 4: Verify active rentals' as '';
SELECT '========================================' as '';

-- Show all active rental devices and their status
SELECT
    fr.id as rental_id,
    fr.borrower_name,
    fr.rental_date,
    fr.return_date,
    fr.status as rental_status,
    frd.device_item_id,
    fdi.device_type,
    fdi.device_code,
    fdi.status as device_status
FROM facility_rentals fr
INNER JOIN facility_rental_devices frd ON fr.id = frd.rental_id
LEFT JOIN facility_device_items fdi ON frd.device_item_id = fdi.id
WHERE fr.status IN ('대여중', '연체')
ORDER BY fr.id, fdi.device_type;

SELECT '========================================' as '';
SELECT 'Cleanup Complete!' as '';
SELECT '========================================' as '';
