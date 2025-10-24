import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedAtToFacility1737680000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // facilities 테이블에 deleted_at 컬럼 추가
    await queryRunner.addColumn(
      'facilities',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 마이그레이션 롤백 시 deleted_at 컬럼 삭제
    await queryRunner.dropColumn('facilities', 'deleted_at');
  }
}
