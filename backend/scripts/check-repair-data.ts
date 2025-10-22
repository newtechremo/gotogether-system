import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function checkRepairData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Repair ID 2의 정보 확인
    const repair = await AppDataSource.query(`
      SELECT
        r.id,
        r.device_item_id,
        r.status as repair_status,
        r.facility_id,
        di.device_code,
        di.status as device_item_status,
        fd.device_type,
        fd.qty_available,
        fd.qty_broken,
        fd.qty_rented,
        fd.qty_total
      FROM facility_repairs r
      LEFT JOIN facility_device_items di ON r.device_item_id = di.id
      LEFT JOIN facility_devices fd ON di.facility_device_id = fd.id
      WHERE r.id = 2
    `);

    console.log('\n=== REPAIR ID 2 ===');
    console.log(JSON.stringify(repair, null, 2));

    // 같은 device_item_id를 참조하는 다른 수리 레코드 확인
    if (repair.length > 0) {
      const deviceItemId = repair[0].device_item_id;

      const otherRepairs = await AppDataSource.query(`
        SELECT id, status, device_item_id
        FROM facility_repairs
        WHERE device_item_id = ?
        ORDER BY id
      `, [deviceItemId]);

      console.log('\n=== ALL REPAIRS FOR THIS DEVICE ITEM ===');
      console.log(JSON.stringify(otherRepairs, null, 2));

      // facility_id 4의 모든 장비 현황
      const devices = await AppDataSource.query(`
        SELECT
          device_type,
          qty_total,
          qty_available,
          qty_broken,
          qty_rented
        FROM facility_devices
        WHERE facility_id = 4
        ORDER BY device_type
      `);

      console.log('\n=== FACILITY 4 DEVICE STATUS ===');
      console.log(JSON.stringify(devices, null, 2));
    }

    await AppDataSource.destroy();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRepairData();
