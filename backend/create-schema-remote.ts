import { DataSource } from 'typeorm';
import { AdminUser } from './src/entities/admin-user.entity';
import { Facility } from './src/entities/facility.entity';
import { FacilityDevice } from './src/entities/facility-device.entity';
import { FacilityDeviceItem } from './src/entities/facility-device-item.entity';
import { FacilityRental } from './src/entities/facility-rental.entity';
import { FacilityRentalDevice } from './src/entities/facility-rental-device.entity';
import { FacilityRepair } from './src/entities/facility-repair.entity';

async function createRemoteSchema() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'gotogether_user',
    password: 'YourStrongPassword123!',
    database: 'gotogether',
    entities: [
      AdminUser,
      Facility,
      FacilityDevice,
      FacilityDeviceItem,
      FacilityRental,
      FacilityRentalDevice,
      FacilityRepair,
    ],
    synchronize: true,
    logging: false,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✓ Database schema created successfully!');

    const tables = await dataSource.query('SHOW TABLES');
    console.log('\nCreated tables:');
    for (const table of tables) {
      const tableName = table[`Tables_in_gotogether`];
      console.log(`  - ${tableName}`);
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

createRemoteSchema();
