import { DataSource } from 'typeorm';
import * as fs from 'fs';

// Helper function to convert ISO date to MySQL datetime
function toMySQLDateTime(isoString: string | null): string | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper function to map facility IDs
function mapFacilityId(originalId: number): number {
  // Map facility_id=4 -> 1, others keep facility_id=2 if exists, otherwise 1
  return originalId === 4 ? 1 : (originalId === 2 ? 2 : 1);
}

async function importToEC2() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'gotogether_user',
    password: 'YourStrongPassword123!',
    database: 'gotogether',
  });

  await dataSource.initialize();
  console.log('Connected to EC2 database\n');

  try {
    // Read exported data
    const exportData = JSON.parse(fs.readFileSync('exported-data.json', 'utf-8'));
    console.log('Loaded exported data from', exportData.exportedAt);
    console.log(`- ${exportData.facilityDevices.length} facility devices`);
    console.log(`- ${exportData.deviceItems.length} facility device items`);
    console.log(`- ${exportData.rentals.length} facility rentals`);
    console.log(`- ${exportData.rentalDevices.length} facility rental devices`);
    console.log(`- ${exportData.repairs.length} facility repairs\n`);

    // Import facility_devices
    console.log('Importing facility_devices...');
    for (const device of exportData.facilityDevices) {
      await dataSource.query(
        `INSERT INTO facility_devices (id, facility_id, device_type, qty_total, qty_available, qty_rented, qty_broken, memo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           qty_total=VALUES(qty_total),
           qty_available=VALUES(qty_available),
           qty_rented=VALUES(qty_rented),
           qty_broken=VALUES(qty_broken)`,
        [
          device.id,
          mapFacilityId(device.facility_id),
          device.device_type,
          device.qty_total,
          device.qty_available,
          device.qty_rented,
          device.qty_broken,
          device.memo,
        ]
      );
    }
    console.log(`✓ Imported ${exportData.facilityDevices.length} facility devices`);

    // Import facility_device_items
    console.log('Importing facility_device_items...');
    for (const item of exportData.deviceItems) {
      await dataSource.query(
        `INSERT INTO facility_device_items (id, facility_id, device_type, device_code, serial_number, status, registration_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status=VALUES(status),
           notes=VALUES(notes)`,
        [
          item.id,
          mapFacilityId(item.facility_id),
          item.device_type,
          item.device_code,
          item.serial_number,
          item.status,
          toMySQLDateTime(item.registration_date),
          item.notes,
        ]
      );
    }
    console.log(`✓ Imported ${exportData.deviceItems.length} facility device items`);

    // Import facility_rentals
    console.log('Importing facility_rentals...');
    for (const rental of exportData.rentals) {
      await dataSource.query(
        `INSERT INTO facility_rentals (
          id, facility_id, rental_date, rental_weekday, rental_type,
          borrower_name, borrower_phone, organization_name, gender, region, residence,
          age_group, rental_purpose, disability_type, return_date,
          expected_users, actual_return_date, status, notes, created_by
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           actual_return_date=VALUES(actual_return_date),
           status=VALUES(status),
           notes=VALUES(notes)`,
        [
          rental.id,
          mapFacilityId(rental.facility_id),
          toMySQLDateTime(rental.rental_date),
          rental.rental_weekday,
          rental.rental_type,
          rental.borrower_name,
          rental.borrower_phone,
          rental.organization_name,
          rental.gender,
          rental.region,
          rental.residence,
          rental.age_group,
          rental.rental_purpose,
          rental.disability_type,
          toMySQLDateTime(rental.return_date),
          rental.expected_users,
          toMySQLDateTime(rental.actual_return_date),
          rental.status,
          rental.notes,
          rental.created_by,
        ]
      );
    }
    console.log(`✓ Imported ${exportData.rentals.length} facility rentals`);

    // Import facility_rental_devices
    console.log('Importing facility_rental_devices...');
    for (const rd of exportData.rentalDevices) {
      await dataSource.query(
        `INSERT INTO facility_rental_devices (
          id, rental_id, device_item_id, device_type, quantity,
          is_returned, return_datetime, return_condition
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           is_returned=VALUES(is_returned),
           return_datetime=VALUES(return_datetime),
           return_condition=VALUES(return_condition)`,
        [
          rd.id,
          rd.rental_id,
          rd.device_item_id,
          rd.device_type,
          rd.quantity,
          rd.is_returned,
          toMySQLDateTime(rd.return_datetime),
          rd.return_condition,
        ]
      );
    }
    console.log(`✓ Imported ${exportData.rentalDevices.length} facility rental devices`);

    // Import facility_repairs
    console.log('Importing facility_repairs...');
    for (const repair of exportData.repairs) {
      await dataSource.query(
        `INSERT INTO facility_repairs (
          id, facility_id, device_item_id, device_type, issue_description,
          status, repair_start_date, repair_end_date, repair_notes
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status=VALUES(status),
           repair_end_date=VALUES(repair_end_date),
           repair_notes=VALUES(repair_notes)`,
        [
          repair.id,
          mapFacilityId(repair.facility_id),
          repair.device_item_id,
          repair.device_type,
          repair.issue_description,
          repair.status,
          toMySQLDateTime(repair.repair_start_date),
          toMySQLDateTime(repair.repair_end_date),
          repair.repair_notes,
        ]
      );
    }
    console.log(`✓ Imported ${exportData.repairs.length} facility repairs`);

    console.log('\n✅ All data imported successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

importToEC2();
