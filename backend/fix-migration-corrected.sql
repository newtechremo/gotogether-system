-- Corrected migration script to fix facility_device_items structure
-- This version checks if facility_device_id exists before using it
-- Run this script manually in MySQL

USE gotogether;

-- 1. Check current table structure
SELECT 'Current facility_device_items structure:' as '';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY ORDINAL_POSITION;

-- 2. Check if facility_device_id column exists
SET @facility_device_id_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'gotogether'
    AND TABLE_NAME = 'facility_device_items'
    AND COLUMN_NAME = 'facility_device_id'
);

SELECT IF(@facility_device_id_exists > 0,
    'facility_device_id column EXISTS - will migrate data',
    'facility_device_id column DOES NOT EXIST - skipping data migration'
) as 'Migration Status';

-- 3. Check if facility_id column already exists
SET @facility_id_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'gotogether'
    AND TABLE_NAME = 'facility_device_items'
    AND COLUMN_NAME = 'facility_id'
);

-- 4. Add facility_id column only if it doesn't exist
SET @sql = IF(@facility_id_exists = 0,
    'ALTER TABLE facility_device_items ADD COLUMN facility_id INT NULL AFTER id',
    'SELECT "facility_id column already exists - skipping creation" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Populate facility_id from facility_device_id if the old column exists
SET @sql = IF(@facility_device_id_exists > 0,
    'UPDATE facility_device_items fdi INNER JOIN facility_devices fd ON fdi.facility_device_id = fd.id SET fdi.facility_id = fd.facility_id',
    'SELECT "Skipping facility_id population - facility_device_id does not exist" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Check if device_type column already exists
SET @device_type_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'gotogether'
    AND TABLE_NAME = 'facility_device_items'
    AND COLUMN_NAME = 'device_type'
);

-- 7. Add device_type column only if it doesn't exist
SET @sql = IF(@device_type_exists = 0,
    'ALTER TABLE facility_device_items ADD COLUMN device_type ENUM(''AR글라스'', ''골전도 이어폰'', ''스마트폰'', ''기타'') NULL AFTER facility_id',
    'SELECT "device_type column already exists - skipping creation" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. Populate device_type from facility_devices if the old column exists
SET @sql = IF(@facility_device_id_exists > 0,
    'UPDATE facility_device_items fdi INNER JOIN facility_devices fd ON fdi.facility_device_id = fd.id SET fdi.device_type = fd.device_type',
    'SELECT "Skipping device_type population - facility_device_id does not exist" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Make facility_id NOT NULL (only if it has data)
SET @null_count = (
    SELECT COUNT(*)
    FROM facility_device_items
    WHERE facility_id IS NULL
);

SET @sql = IF(@null_count = 0 AND @facility_id_exists = 1,
    'ALTER TABLE facility_device_items MODIFY COLUMN facility_id INT NOT NULL',
    CONCAT('SELECT "Cannot make facility_id NOT NULL - ', @null_count, ' rows have NULL values" as ""')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10. Make device_type NOT NULL (only if it has data)
SET @null_count = (
    SELECT COUNT(*)
    FROM facility_device_items
    WHERE device_type IS NULL
);

SET @sql = IF(@null_count = 0 AND @device_type_exists = 1,
    'ALTER TABLE facility_device_items MODIFY COLUMN device_type ENUM(''AR글라스'', ''골전도 이어폰'', ''스마트폰'', ''기타'') NOT NULL',
    CONCAT('SELECT "Cannot make device_type NOT NULL - ', @null_count, ' rows have NULL values" as ""')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11. Add index on facility_id if it doesn't exist
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'gotogether'
    AND TABLE_NAME = 'facility_device_items'
    AND INDEX_NAME = 'IDX_facility_device_items_facility_id'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX IDX_facility_device_items_facility_id ON facility_device_items(facility_id)',
    'SELECT "Index IDX_facility_device_items_facility_id already exists" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 12. Add foreign key constraint if it doesn't exist
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
    'SELECT "Foreign key FK_facility_device_items_facility_id already exists" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 13. Make facility_device_id nullable if it exists (for backward compatibility)
SET @sql = IF(@facility_device_id_exists > 0,
    'ALTER TABLE facility_device_items MODIFY COLUMN facility_device_id INT NULL',
    'SELECT "Skipping facility_device_id modification - column does not exist" as ""'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 14. Final verification
SELECT 'Final facility_device_items structure:' as '';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_TYPE,
    COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY ORDINAL_POSITION;

SELECT 'Indexes on facility_device_items:' as '';
SELECT
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT 'Foreign keys on facility_device_items:' as '';
SELECT
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
AND REFERENCED_TABLE_NAME IS NOT NULL;
