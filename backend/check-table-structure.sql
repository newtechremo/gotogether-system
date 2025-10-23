-- Diagnostic script to check current table structure
-- Run this first to understand what needs to be migrated

USE gotogether;

SELECT '========================================' as '';
SELECT 'DIAGNOSTIC: facility_device_items TABLE' as '';
SELECT '========================================' as '';

-- Check if table exists
SELECT IF(
    (SELECT COUNT(*) FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = 'gotogether' AND TABLE_NAME = 'facility_device_items') > 0,
    'Table EXISTS',
    'Table DOES NOT EXIST'
) as 'Table Status';

-- Check columns
SELECT 'Current Columns:' as '';
SELECT
    ORDINAL_POSITION as 'Position',
    COLUMN_NAME as 'Column Name',
    COLUMN_TYPE as 'Type',
    IS_NULLABLE as 'Nullable',
    COLUMN_KEY as 'Key',
    COLUMN_DEFAULT as 'Default'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY ORDINAL_POSITION;

-- Check specific columns
SELECT 'Column Existence Check:' as '';
SELECT
    'facility_device_id' as 'Column Name',
    IF((SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = 'gotogether'
        AND TABLE_NAME = 'facility_device_items'
        AND COLUMN_NAME = 'facility_device_id') > 0, 'EXISTS', 'DOES NOT EXIST') as 'Status'
UNION ALL
SELECT
    'facility_id' as 'Column Name',
    IF((SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = 'gotogether'
        AND TABLE_NAME = 'facility_device_items'
        AND COLUMN_NAME = 'facility_id') > 0, 'EXISTS', 'DOES NOT EXIST') as 'Status'
UNION ALL
SELECT
    'device_type' as 'Column Name',
    IF((SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = 'gotogether'
        AND TABLE_NAME = 'facility_device_items'
        AND COLUMN_NAME = 'device_type') > 0, 'EXISTS', 'DOES NOT EXIST') as 'Status';

-- Check indexes
SELECT 'Current Indexes:' as '';
SELECT
    INDEX_NAME as 'Index Name',
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as 'Columns',
    NON_UNIQUE as 'Non-Unique'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
GROUP BY INDEX_NAME, NON_UNIQUE;

-- Check foreign keys
SELECT 'Foreign Key Constraints:' as '';
SELECT
    CONSTRAINT_NAME as 'Constraint Name',
    COLUMN_NAME as 'Column',
    CONCAT(REFERENCED_TABLE_NAME, '.', REFERENCED_COLUMN_NAME) as 'References'
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check row count
SELECT 'Row Count:' as '';
SELECT COUNT(*) as 'Total Rows' FROM facility_device_items;

-- Check for NULL values in key columns (if they exist)
SELECT 'NULL Value Check:' as '';
SELECT
    SUM(CASE WHEN facility_id IS NULL THEN 1 ELSE 0 END) as 'NULL facility_id',
    SUM(CASE WHEN device_type IS NULL THEN 1 ELSE 0 END) as 'NULL device_type'
FROM facility_device_items;

SELECT '========================================' as '';
SELECT 'END OF DIAGNOSTIC' as '';
SELECT '========================================' as '';
