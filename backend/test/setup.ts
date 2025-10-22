import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AdminUser } from '../src/entities/admin-user.entity';
import { Facility } from '../src/entities/facility.entity';

/**
 * 테스트 환경용 TypeORM 설정
 * MySQL 테스트 데이터베이스 사용
 *
 * Note: ENUM 타입 지원을 위해 SQLite 대신 MySQL 사용
 * 테스트 전에 MySQL 테스트 DB가 준비되어 있어야 합니다.
 */
export const testTypeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || process.env.DB_PORT || '3306'),
  username: process.env.TEST_DB_USERNAME || process.env.DB_USERNAME || 'gt_db',
  password:
    process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'gtpw1@3$',
  database: process.env.TEST_DB_NAME || process.env.DB_NAME || 'gotogether',
  entities: [AdminUser, Facility],
  synchronize: true, // 테스트 환경에서는 자동 동기화
  dropSchema: true, // 각 테스트 실행 시 스키마 초기화
  logging: false,
  charset: 'utf8mb4',
  timezone: '+09:00',
};

/**
 * JWT 테스트 환경 설정
 */
export const testJwtConfig = {
  secret: 'test-jwt-secret-key-for-testing-only',
  signOptions: { expiresIn: 3600 },
};

/**
 * 테스트용 환경변수 설정
 */
export const setupTestEnvironment = () => {
  process.env.JWT_SECRET = testJwtConfig.secret;
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
};

/**
 * 테스트 전 환경 초기화
 */
export const beforeAllTests = () => {
  setupTestEnvironment();
};

/**
 * 각 테스트 후 정리
 */
export const afterEachTest = () => {
  jest.clearAllMocks();
};
