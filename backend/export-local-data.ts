import { DataSource } from 'typeorm';
import * as fs from 'fs';

async function exportLocalData() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'gt_db',
    password: 'gtpw1@3$',
    database: 'gotogether',
  });

  await dataSource.initialize();
  console.log('Connected to local database\n');

  try {
    // Export facility devices
    const facilityDevices = await dataSource.query(`
      SELECT * FROM facility_devices
    `);
    console.log(`Exported ${facilityDevices.length} facility devices`);

    // Export facility device items
    const deviceItems = await dataSource.query(`
      SELECT * FROM facility_device_items
    `);
    console.log(`Exported ${deviceItems.length} facility device items`);

    // Export facility rentals
    const rentals = await dataSource.query(`
      SELECT * FROM facility_rentals
    `);
    console.log(`Exported ${rentals.length} facility rentals`);

    // Export facility rental devices
    const rentalDevices = await dataSource.query(`
      SELECT * FROM facility_rental_devices
    `);
    console.log(`Exported ${rentalDevices.length} facility rental devices`);

    // Export facility repairs
    const repairs = await dataSource.query(`
      SELECT * FROM facility_repairs
    `);
    console.log(`Exported ${repairs.length} facility repairs`);

    // Save to JSON file
    const exportData = {
      facilityDevices,
      deviceItems,
      rentals,
      rentalDevices,
      repairs,
      exportedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      'exported-data.json',
      JSON.stringify(exportData, null, 2)
    );

    console.log('\n✅ Data exported to exported-data.json');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

exportLocalData();
