# Migration Guide: facility_device_items Table Structure Fix

## Problem Overview

The error you encountered:
```
Error Code: 1054. Unknown column 'fdi.facility_device_id' in 'on clause'
```

This occurs because the `facility_device_items` table structure has been refactored:

**Old Structure:**
- `facility_device_items.facility_device_id` → `facility_devices.id` → `facility_devices.facility_id` → `facilities.id`
- Device type stored only in `facility_devices`

**New Structure (Current):**
- `facility_device_items.facility_id` → `facilities.id` (direct relationship)
- Device type stored in both `facility_device_items` AND `facility_devices`

## Step-by-Step Resolution

### Step 1: Diagnose Current State

Run the diagnostic script to understand your current table structure:

```bash
mysql -u [username] -p gotogether < backend/check-table-structure.sql
```

This will show you:
- Whether `facility_device_id` column still exists
- Whether `facility_id` column already exists
- Whether `device_type` column already exists
- Current row counts and NULL values

### Step 2: Choose Migration Path

Based on the diagnostic results:

#### Scenario A: `facility_device_id` EXISTS (Old Schema)
✅ You need to run the full migration script

```bash
mysql -u [username] -p gotogether < backend/fix-migration-corrected.sql
```

This will:
1. Add `facility_id` column
2. Copy data from `facility_devices` to populate `facility_id`
3. Add `device_type` column
4. Copy device type from `facility_devices`
5. Add indexes and foreign keys
6. Make `facility_device_id` nullable for backward compatibility

#### Scenario B: `facility_device_id` DOES NOT EXIST (Already Migrated/Fresh Install)
✅ The table is already in the new structure

If `facility_id` and `device_type` columns exist and are populated, you're good to go! The error in `fix-migration.sql` can be ignored because the migration was already completed or the table was created fresh.

#### Scenario C: Partial Migration (facility_id exists but empty)
⚠️ You need to manually populate the data

If you have data in `facility_device_items` but `facility_id` is NULL:

```sql
-- Manually set facility_id for existing items
-- You'll need to determine the correct facility_id for each item
-- Option 1: If you have only one facility (for testing)
UPDATE facility_device_items SET facility_id = 1 WHERE facility_id IS NULL;

-- Option 2: If items should be associated with specific facilities
-- You'll need custom logic based on your data
```

### Step 3: Verify Migration Success

After migration, verify the changes:

```sql
USE gotogether;

-- Check final structure
DESCRIBE facility_device_items;

-- Verify data integrity
SELECT
    COUNT(*) as total_items,
    SUM(CASE WHEN facility_id IS NULL THEN 1 ELSE 0 END) as null_facility_id,
    SUM(CASE WHEN device_type IS NULL THEN 1 ELSE 0 END) as null_device_type
FROM facility_device_items;

-- Check that facility_ids are valid
SELECT
    fdi.id,
    fdi.facility_id,
    f.facility_name
FROM facility_device_items fdi
LEFT JOIN facilities f ON fdi.facility_id = f.id
WHERE f.id IS NULL;  -- Should return 0 rows

-- Verify foreign key constraints
SELECT
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'gotogether'
AND TABLE_NAME = 'facility_device_items'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Step 4: Update Application Code

Ensure your TypeORM entities match the new structure:

**✅ Correct (Current):**
```typescript
// backend/src/entities/facility-device-item.entity.ts
@Entity('facility_device_items')
export class FacilityDeviceItem {
  @Column({ name: 'facility_id' })
  facilityId: number;

  @Column({
    type: 'enum',
    enum: ['AR글라스', '골전도 이어폰', '스마트폰', '기타'],
    name: 'device_type',
  })
  deviceType: string;

  @ManyToOne(() => Facility, (facility) => facility.deviceItems)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;
}
```

**❌ Incorrect (Old):**
```typescript
// Don't use this anymore
@Column({ name: 'facility_device_id' })
facilityDeviceId: number;

@ManyToOne(() => FacilityDevice, (device) => device.deviceItems)
@JoinColumn({ name: 'facility_device_id' })
facilityDevice: FacilityDevice;
```

## Common Issues and Solutions

### Issue 1: "Column already exists" error
**Solution:** The migration script (`fix-migration-corrected.sql`) handles this automatically by checking if columns exist before adding them.

### Issue 2: Foreign key constraint violation
**Solution:** Ensure all `facility_id` values in `facility_device_items` reference valid rows in the `facilities` table:

```sql
-- Find orphaned items
SELECT * FROM facility_device_items
WHERE facility_id NOT IN (SELECT id FROM facilities);

-- Fix by setting to a valid facility or deleting
```

### Issue 3: NULL values in required columns
**Solution:** The corrected migration script will NOT make columns NOT NULL if there are NULL values. You need to populate them first:

```sql
-- Check for NULLs
SELECT * FROM facility_device_items WHERE facility_id IS NULL OR device_type IS NULL;

-- Populate as needed based on your business logic
```

## Files Reference

- `backend/fix-migration.sql` - Original migration (has the error)
- `backend/fix-migration-corrected.sql` - Corrected version with safety checks
- `backend/check-table-structure.sql` - Diagnostic script
- `backend/src/entities/facility-device-item.entity.ts` - TypeORM entity definition
- `docs/erd.md` - Database schema documentation (needs update)

## Documentation Updates Needed

After successful migration, update these files:

1. **docs/erd.md** (line 93-104):
   - Update `facility_device_items` table structure
   - Remove `facility_device_id` column
   - Add `facility_id` and `device_type` columns
   - Update the relationship diagram

2. **CLAUDE.md**:
   - Update the architecture section to reflect new direct relationship
   - Update any queries that reference `facility_device_id`

## Testing After Migration

Run these tests to ensure everything works:

```bash
# 1. Backend tests
cd backend
npm run test

# 2. Check if application starts
npm run start:dev

# 3. Test device creation/listing
curl http://localhost:3000/facility/devices \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Test rental creation (should work with new structure)
```

## Rollback Plan

If you need to rollback (NOT RECOMMENDED unless necessary):

```sql
-- Backup data first!
CREATE TABLE facility_device_items_backup AS SELECT * FROM facility_device_items;

-- Rollback steps would involve:
-- 1. Drop new columns
-- 2. Re-add facility_device_id
-- 3. Restore relationships
-- (Not providing full script as rollback is risky)
```

## Support

If you encounter issues:
1. Check the diagnostic output from `check-table-structure.sql`
2. Review error messages carefully
3. Ensure you have database backups before running migrations
4. Test in development environment first

## Summary

The refactoring simplifies the data model by removing the intermediate `facility_devices` relationship for individual items. This makes queries more efficient and the schema easier to understand. The migration is designed to be safe and idempotent (can be run multiple times).
