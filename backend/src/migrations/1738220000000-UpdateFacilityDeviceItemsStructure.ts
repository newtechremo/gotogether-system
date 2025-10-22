import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFacilityDeviceItemsStructure1738220000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 0. 기존 데이터가 있는지 확인
    const hasData = await queryRunner.query(`
      SELECT COUNT(*) as count FROM facility_device_items
    `);

    const dataExists = hasData[0].count > 0;

    // 1. facility_device_items에 facility_id 컬럼 추가 (NULL 허용으로 먼저 추가)
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      ADD COLUMN facility_id INT NULL AFTER id
    `);

    // 2. 기존 데이터가 있으면 facility_id 값 채우기
    if (dataExists) {
      await queryRunner.query(`
        UPDATE facility_device_items fdi
        INNER JOIN facility_devices fd ON fdi.facility_device_id = fd.id
        SET fdi.facility_id = fd.facility_id
      `);
    }

    // 3. facility_id를 NOT NULL로 변경
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      MODIFY COLUMN facility_id INT NOT NULL
    `);

    // 4. device_type 컬럼 추가 (NULL 허용으로 먼저 추가)
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      ADD COLUMN device_type ENUM('AR글라스', '골전도 이어폰', '스마트폰', '기타') NULL AFTER facility_id
    `);

    // 5. 기존 데이터가 있으면 device_type 값 채우기
    if (dataExists) {
      await queryRunner.query(`
        UPDATE facility_device_items fdi
        INNER JOIN facility_devices fd ON fdi.facility_device_id = fd.id
        SET fdi.device_type = fd.device_type
      `);
    }

    // 6. device_type을 NOT NULL로 변경
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      MODIFY COLUMN device_type ENUM('AR글라스', '골전도 이어폰', '스마트폰', '기타') NOT NULL
    `);

    // 7. facility_id에 인덱스 추가
    await queryRunner.query(`
      CREATE INDEX IDX_facility_device_items_facility_id ON facility_device_items(facility_id)
    `);

    // 8. facility_id 외래키 추가
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      ADD CONSTRAINT FK_facility_device_items_facility_id
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    `);

    // 9. 기존 facility_device_id 외래키 제거 (존재하는 경우에만)
    const foreignKeys = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'facility_device_items'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_NAME LIKE '%facility_device_id%'
    `);

    if (foreignKeys.length > 0) {
      for (const fk of foreignKeys) {
        await queryRunner.query(`
          ALTER TABLE facility_device_items
          DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
        `);
      }
    }

    // 10. facility_device_id 컬럼을 NULL 허용으로 변경 (나중에 완전히 제거 가능하도록)
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      MODIFY COLUMN facility_device_id INT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: 외래키 제거
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      DROP FOREIGN KEY FK_facility_device_items_facility_id
    `);

    // 인덱스 제거
    await queryRunner.query(`
      DROP INDEX IDX_facility_device_items_facility_id ON facility_device_items
    `);

    // device_type 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      DROP COLUMN device_type
    `);

    // facility_id 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      DROP COLUMN facility_id
    `);

    // 기존 외래키 복구
    await queryRunner.query(`
      ALTER TABLE facility_device_items
      ADD CONSTRAINT FK_facility_device_items_facility_device_id
      FOREIGN KEY (facility_device_id) REFERENCES facility_devices(id)
    `);
  }
}
