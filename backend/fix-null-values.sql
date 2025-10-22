-- Emergency fix for NULL value issues in facility_device_items
-- This script safely handles NULL values before TypeORM synchronization

USE gotogether;

SELECT '========================================' as '';
SELECT 'STEP 1: Check Current State' as '';
SELECT '========================================' as '';

-- Check if table exists
SELECT IF(
    (SELECT COUNT(*) FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = 'gotogether' AND TABLE_NAME = 'facility_device_items') > 0,
    'Table EXISTS',
    'Table DOES NOT EXIST - Creating will be done by TypeORM'
) as 'Status';

-- Check current structure (only if table exists)
SELECT 'Current Columns:' as '';
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY ORDINAL_POSITION;

-- Check for data
SELECT 'Row Count:' as '';
SELECT COUNT(*) as 'Total Rows' FROM facility_device_items;

SELECT '========================================' as '';
SELECT 'STEP 2: Check for NULL Values' as '';
SELECT '========================================' as '';

-- Check for NULL values in critical columns
SELECT
    COUNT(*) as total_rows,
    SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) as null_id,
    SUM(CASE WHEN facility_id IS NULL THEN 1 ELSE 0 END) as null_facility_id,
    SUM(CASE WHEN device_type IS NULL THEN 1 ELSE 0 END) as null_device_type,
    SUM(CASE WHEN device_code IS NULL THEN 1 ELSE 0 END) as null_device_code,
    SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) as null_status
FROM facility_device_items;

SELECT '========================================' as '';
SELECT 'STEP 3: Fix NULL Values' as '';
SELECT '========================================' as '';

-- Make columns nullable temporarily to avoid TypeORM sync errors
ALTER TABLE facility_device_items
MODIFY COLUMN facility_id INT NULL;

ALTER TABLE facility_device_items
MODIFY COLUMN device_type ENUM('AR글라스', '골전도 이어폰', '스마트폰', '기타') NULL;

ALTER TABLE facility_device_items
MODIFY COLUMN device_code VARCHAR(100) NULL;

ALTER TABLE facility_device_items
MODIFY COLUMN status ENUM('available', 'rented', 'broken', 'maintenance') NULL DEFAULT 'available';

SELECT 'Made key columns nullable to prevent sync errors' as 'Status';

SELECT '========================================' as '';
SELECT 'STEP 4: Handle Existing Data' as '';
SELECT '========================================' as '';

-- Set default status for NULL status values
UPDATE facility_device_items
SET status = 'available'
WHERE status IS NULL;

SELECT 'Fixed NULL status values' as 'Status';

-- Show rows that still need manual fixing
SELECT 'Rows requiring manual attention:' as '';
SELECT
    id,
    facility_id,
    device_type,
    device_code,
    status
FROM facility_device_items
WHERE facility_id IS NULL
   OR device_type IS NULL
   OR device_code IS NULL;

SELECT '========================================' as '';
SELECT 'STEP 5: Verify State' as '';
SELECT '========================================' as '';

-- Final check
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY ORDINAL_POSITION;

SELECT 'Fix complete. TypeORM should now be able to sync.' as 'Status';
SELECT 'You may need to manually populate facility_id, device_type, or device_code for some rows.' as 'Note';
