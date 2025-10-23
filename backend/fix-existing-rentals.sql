-- Fix existing rentals with NULL device_item_id
-- This script manually assigns available devices to existing rentals

USE gotogether;

SELECT '========================================' as '';
SELECT 'Step 1: Check rentals with NULL device_item_id' as '';
SELECT '========================================' as '';

-- Show rentals without device_item_id
SELECT
    fr.id as rental_id,
    fr.borrower_name,
    fr.status,
    frd.id as rental_device_id,
    frd.device_item_id,
    frd.device_type,
    frd.quantity
FROM facility_rentals fr
INNER JOIN facility_rental_devices frd ON fr.id = frd.rental_id
WHERE fr.status IN ('대여중', '연체')
  AND frd.device_item_id IS NULL
ORDER BY fr.id, frd.device_type;

SELECT '========================================' as '';
SELECT 'Step 2: Summary by device type' as '';
SELECT '========================================' as '';

SELECT
    frd.device_type,
    COUNT(*) as rental_device_count,
    SUM(frd.quantity) as total_quantity_needed
FROM facility_rentals fr
INNER JOIN facility_rental_devices frd ON fr.id = frd.rental_id
WHERE fr.status IN ('대여중', '연체')
  AND frd.device_item_id IS NULL
GROUP BY frd.device_type;

SELECT '========================================' as '';
SELECT 'Step 3: Available devices by type' as '';
SELECT '========================================' as '';

SELECT
    device_type,
    COUNT(*) as available_count
FROM facility_device_items
WHERE status = 'available'
  AND facility_id = 1
GROUP BY device_type;

SELECT '========================================' as '';
SELECT 'SOLUTION: Manual Assignment Process' as '';
SELECT '========================================' as '';

SELECT 'Since device_item_id is NULL, we need to manually assign devices.' as 'Info';
SELECT 'Option 1: Assign specific available devices to each rental_device record' as 'Option 1';
SELECT 'Option 2: Keep as NULL and update only when device_item_id exists in return logic' as 'Option 2';
SELECT 'We will implement Option 2 in the code (safer for existing data)' as 'Recommended';

SELECT '========================================' as '';
SELECT 'Current status of rented devices' as '';
SELECT '========================================' as '';

-- Show devices that are marked as rented but not linked to any rental
SELECT
    fdi.id,
    fdi.device_type,
    fdi.device_code,
    fdi.status,
    COUNT(frd.id) as linked_rentals
FROM facility_device_items fdi
LEFT JOIN facility_rental_devices frd ON fdi.id = frd.device_item_id
WHERE fdi.status = 'rented'
  AND fdi.facility_id = 1
GROUP BY fdi.id, fdi.device_type, fdi.device_code, fdi.status;
