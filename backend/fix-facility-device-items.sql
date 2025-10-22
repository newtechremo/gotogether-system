-- Fix facility_device_items table to resolve TypeORM sync errors
-- This populates NULL values for facility_id and device_type

USE gotogether;

SELECT '========================================' as '';
SELECT 'Fixing facility_device_items NULL values' as '';
SELECT '========================================' as '';

-- Step 1: Check current state
SELECT 'Current NULL count:' as '';
SELECT
    COUNT(*) as total_rows,
    SUM(CASE WHEN facility_id IS NULL THEN 1 ELSE 0 END) as null_facility_id,
    SUM(CASE WHEN device_type IS NULL THEN 1 ELSE 0 END) as null_device_type
FROM facility_device_items;

-- Step 2: Determine device_type from device_code patterns
-- AR-xxx -> AR글라스
-- BC-xxx -> 골전도 이어폰
-- SP-xxx -> 스마트폰
SELECT 'Updating device_type based on device_code pattern...' as '';

UPDATE facility_device_items
SET device_type = CASE
    WHEN device_code LIKE 'AR-%' THEN 'AR글라스'
    WHEN device_code LIKE 'BC-%' THEN '골전도 이어폰'
    WHEN device_code LIKE 'SP-%' THEN '스마트폰'
    WHEN notes LIKE '%AR%' OR notes LIKE '%글라스%' THEN 'AR글라스'
    WHEN notes LIKE '%골전도%' OR notes LIKE '%이어폰%' THEN '골전도 이어폰'
    WHEN notes LIKE '%스마트폰%' THEN '스마트폰'
    ELSE 'AR글라스'  -- Default to AR글라스 for unknown cases
END
WHERE device_type IS NULL;

SELECT CONCAT('Updated ', ROW_COUNT(), ' rows with device_type') as 'Status';

-- Step 3: Set facility_id
-- First, check what facilities exist
SELECT 'Available facilities:' as '';
SELECT id, facility_code, facility_name FROM facilities ORDER BY id LIMIT 10;

-- For now, we'll set all items to the first facility (facility_id = 1)
-- You can modify this logic based on your business requirements
SELECT 'Setting facility_id to first available facility...' as '';

SET @first_facility_id = (SELECT MIN(id) FROM facilities);

UPDATE facility_device_items
SET facility_id = @first_facility_id
WHERE facility_id IS NULL;

SELECT CONCAT('Updated ', ROW_COUNT(), ' rows with facility_id = ', @first_facility_id) as 'Status';

-- Step 4: Verify no more NULL values
SELECT 'Verification - NULL count after fix:' as '';
SELECT
    COUNT(*) as total_rows,
    SUM(CASE WHEN facility_id IS NULL THEN 1 ELSE 0 END) as null_facility_id,
    SUM(CASE WHEN device_type IS NULL THEN 1 ELSE 0 END) as null_device_type
FROM facility_device_items;

-- Step 5: Show sample data
SELECT 'Sample data after fix:' as '';
SELECT
    id,
    facility_id,
    device_type,
    device_code,
    status,
    notes
FROM facility_device_items
ORDER BY id
LIMIT 10;

-- Step 6: Now make the columns NOT NULL to match entity definition
SELECT 'Making columns NOT NULL to match entity definition...' as '';

ALTER TABLE facility_device_items
MODIFY COLUMN facility_id INT NOT NULL;

ALTER TABLE facility_device_items
MODIFY COLUMN device_type ENUM('AR글라스', '골전도 이어폰', '스마트폰', '기타') NOT NULL;

SELECT 'Columns are now NOT NULL' as 'Status';

-- Step 7: Add foreign key if it doesn't exist
SELECT 'Checking foreign key constraint...' as '';

SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'gotogether'
    AND TABLE_NAME = 'facility_device_items'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND CONSTRAINT_NAME = 'FK_facility_device_items_facility_id'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE facility_device_items ADD CONSTRAINT FK_facility_device_items_facility_id FOREIGN KEY (facility_id) REFERENCES facilities(id)',
    'SELECT "Foreign key already exists" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Add index if it doesn't exist
SELECT 'Checking index...' as '';

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'gotogether'
    AND TABLE_NAME = 'facility_device_items'
    AND INDEX_NAME = 'IDX_facility_device_items_facility_id'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX IDX_facility_device_items_facility_id ON facility_device_items(facility_id)',
    'SELECT "Index already exists" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Final verification
SELECT '========================================' as '';
SELECT 'Final Table Structure:' as '';
SELECT '========================================' as '';

SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY ORDINAL_POSITION;

SELECT '========================================' as '';
SELECT 'Fix Complete!' as '';
SELECT 'TypeORM synchronization should now work without errors.' as '';
SELECT '========================================' as '';
