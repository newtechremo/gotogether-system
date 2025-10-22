-- Manual migration script to fix facility_device_items structure
-- Run this script manually in MySQL

USE gotogether;

-- 1. Check if columns already exist and drop them if needed
SET @col_exists = (SELECT COUNT(*)
                   FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = 'gotogether'
                   AND TABLE_NAME = 'facility_device_items'
                   AND COLUMN_NAME = 'facility_id');

-- Drop facility_id column if it exists (to start fresh)
SET @sql = IF(@col_exists > 0,
    'ALTER TABLE facility_device_items DROP COLUMN facility_id',
    'SELECT "facility_id column does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*)
                   FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = 'gotogether'
                   AND TABLE_NAME = 'facility_device_items'
                   AND COLUMN_NAME = 'device_type');

-- Drop device_type column if it exists
SET @sql = IF(@col_exists > 0,
    'ALTER TABLE facility_device_items DROP COLUMN device_type',
    'SELECT "device_type column does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Drop any existing foreign key constraints on facility_id
SELECT CONSTRAINT_NAME INTO @fk_name
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%facility_id%'
LIMIT 1;

SET @sql = IF(@fk_name IS NOT NULL,
    CONCAT('ALTER TABLE facility_device_items DROP FOREIGN KEY ', @fk_name),
    'SELECT "No foreign key to drop"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Now add facility_id column (NULL first)
ALTER TABLE facility_device_items
ADD COLUMN facility_id INT NULL AFTER id;

-- 4. Fill facility_id from existing facility_devices relationship (if data exists)
UPDATE facility_device_items fdi
INNER JOIN facility_devices fd ON fdi.facility_device_id = fd.id
SET fdi.facility_id = fd.facility_id;

-- 5. Make facility_id NOT NULL
ALTER TABLE facility_device_items
MODIFY COLUMN facility_id INT NOT NULL;

-- 6. Add device_type column (NULL first)
ALTER TABLE facility_device_items
ADD COLUMN device_type ENUM('AR글라스', '골전도 이어폰', '스마트폰', '기타') NULL AFTER facility_id;

-- 7. Fill device_type from existing facility_devices relationship (if data exists)
UPDATE facility_device_items fdi
INNER JOIN facility_devices fd ON fdi.facility_device_id = fd.id
SET fdi.device_type = fd.device_type;

-- 8. Make device_type NOT NULL
ALTER TABLE facility_device_items
MODIFY COLUMN device_type ENUM('AR글라스', '골전도 이어폰', '스마트폰', '기타') NOT NULL;

-- 9. Add index on facility_id
CREATE INDEX IDX_facility_device_items_facility_id ON facility_device_items(facility_id);

-- 10. Add foreign key constraint
ALTER TABLE facility_device_items
ADD CONSTRAINT FK_facility_device_items_facility_id
FOREIGN KEY (facility_id) REFERENCES facilities(id);

-- 11. Make facility_device_id nullable (for backward compatibility)
ALTER TABLE facility_device_items
MODIFY COLUMN facility_device_id INT NULL;

-- 12. Verify the changes
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
