import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../src/auth/auth.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { testTypeOrmConfig, testJwtConfig } from './setup';
import { AdminUser, AdminRole } from '../src/entities/admin-user.entity';
import { Facility } from '../src/entities/facility.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let adminUserRepository: Repository<AdminUser>;
  let facilityRepository: Repository<Facility>;

  // 테스트용 사용자 데이터
  const testAdminUser = {
    username: 'testadmin',
    password: 'Test1234!',
    name: '테스트 관리자',
    role: AdminRole.ADMIN,
    email: 'test@example.com',
    phoneNumber: '010-1234-5678',
  };

  const testFacility = {
    facilityCode: 'TEST001',
    username: 'testfacility',
    password: 'Test1234!',
    facilityName: '테스트 시설',
    managerName: '시설 관리자',
    managerPhone: '010-9876-5432',
    address: '서울시 강남구',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testTypeOrmConfig),
        TypeOrmModule.forFeature([AdminUser, Facility]),
        JwtModule.register(testJwtConfig),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Global filters and pipes 설정 (main.ts와 동일)
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Repository 가져오기
    adminUserRepository = moduleFixture.get<Repository<AdminUser>>(
      getRepositoryToken(AdminUser),
    );
    facilityRepository = moduleFixture.get<Repository<Facility>>(
      getRepositoryToken(Facility),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 각 테스트 전에 데이터베이스 초기화
    // Foreign key constraint를 고려하여 순서대로 삭제
    await facilityRepository.createQueryBuilder().delete().execute();
    await adminUserRepository.createQueryBuilder().delete().execute();
  });

  describe('POST /auth/admin/login', () => {
    it('should successfully login admin user (성공)', async () => {
      // Given: 테스트 관리자 계정 생성
      const hashedPassword = await bcrypt.hash(testAdminUser.password, 10);
      await adminUserRepository.save({
        ...testAdminUser,
        password: hashedPassword,
        isActive: true,
      });

      // When: 로그인 요청
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: testAdminUser.username,
          password: testAdminUser.password,
        })
        .expect(200);

      // Then: 응답 검증
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('expires_in', 3600);

      // User 정보 검증
      expect(response.body.data.user).toMatchObject({
        username: testAdminUser.username,
        name: testAdminUser.name,
        role: testAdminUser.role,
      });
      expect(response.body.data.user).toHaveProperty('permissions');
    });

    it('should fail login with invalid username (실패 - 잘못된 사용자명)', async () => {
      // Given: 테스트 관리자 계정 생성
      const hashedPassword = await bcrypt.hash(testAdminUser.password, 10);
      await adminUserRepository.save({
        ...testAdminUser,
        password: hashedPassword,
        isActive: true,
      });

      // When: 잘못된 사용자명으로 로그인 시도
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: 'wrongusername',
          password: testAdminUser.password,
        })
        .expect(401);

      // Then: 에러 응답 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'AUTH_001');
      expect(response.body.error).toHaveProperty(
        'message',
        'Invalid credentials',
      );
    });

    it('should fail login with invalid password (실패 - 잘못된 비밀번호)', async () => {
      // Given: 테스트 관리자 계정 생성
      const hashedPassword = await bcrypt.hash(testAdminUser.password, 10);
      await adminUserRepository.save({
        ...testAdminUser,
        password: hashedPassword,
        isActive: true,
      });

      // When: 잘못된 비밀번호로 로그인 시도
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: testAdminUser.username,
          password: 'wrongpassword',
        })
        .expect(401);

      // Then: 에러 응답 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'AUTH_001');
      expect(response.body.error).toHaveProperty(
        'message',
        'Invalid credentials',
      );
    });

    it('should fail login with inactive user (실패 - 비활성 계정)', async () => {
      // Given: 비활성 관리자 계정 생성
      const hashedPassword = await bcrypt.hash(testAdminUser.password, 10);
      await adminUserRepository.save({
        ...testAdminUser,
        password: hashedPassword,
        isActive: false, // 비활성
      });

      // When: 로그인 시도
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: testAdminUser.username,
          password: testAdminUser.password,
        })
        .expect(401);

      // Then: 에러 응답 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'AUTH_001');
    });

    it('should fail login with missing fields (실패 - 필수 필드 누락)', async () => {
      // When: username 누락
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          password: testAdminUser.password,
        })
        .expect(400);

      // Then: Validation 에러 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/facility/login', () => {
    it('should successfully login facility user (성공)', async () => {
      // Given: 테스트 시설 계정 생성
      const hashedPassword = await bcrypt.hash(testFacility.password, 10);
      await facilityRepository.save({
        ...testFacility,
        password: hashedPassword,
        isActive: true,
      });

      // When: 로그인 요청
      const response = await request(app.getHttpServer())
        .post('/auth/facility/login')
        .send({
          username: testFacility.username,
          password: testFacility.password,
        })
        .expect(200);

      // Then: 응답 검증
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('refresh_token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('expires_in', 3600);

      // User 정보 검증
      expect(response.body.data.user).toMatchObject({
        username: testFacility.username,
        name: testFacility.managerName,
        facilityName: testFacility.facilityName,
      });
      expect(response.body.data.user).toHaveProperty('facilityId');
    });

    it('should fail login with invalid credentials (실패)', async () => {
      // Given: 테스트 시설 계정 생성
      const hashedPassword = await bcrypt.hash(testFacility.password, 10);
      await facilityRepository.save({
        ...testFacility,
        password: hashedPassword,
        isActive: true,
      });

      // When: 잘못된 비밀번호로 로그인 시도
      const response = await request(app.getHttpServer())
        .post('/auth/facility/login')
        .send({
          username: testFacility.username,
          password: 'wrongpassword',
        })
        .expect(401);

      // Then: 에러 응답 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'AUTH_001');
      expect(response.body.error).toHaveProperty(
        'message',
        'Invalid credentials',
      );
    });
  });

  describe('GET /auth/me - JWT 토큰으로 보호된 엔드포인트 접근', () => {
    it('should access protected endpoint with valid JWT token (성공)', async () => {
      // Given: 테스트 관리자 계정 생성 및 로그인
      const hashedPassword = await bcrypt.hash(testAdminUser.password, 10);
      await adminUserRepository.save({
        ...testAdminUser,
        password: hashedPassword,
        isActive: true,
      });

      // 로그인하여 토큰 획득
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: testAdminUser.username,
          password: testAdminUser.password,
        });

      const accessToken = loginResponse.body.data.access_token;

      // When: JWT 토큰으로 보호된 엔드포인트 접근
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then: 사용자 정보 응답 검증
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        username: testAdminUser.username,
        name: testAdminUser.name,
        role: testAdminUser.role,
        type: 'admin',
      });
    });

    it('should fail access without JWT token (실패 - 토큰 없음)', async () => {
      // When: JWT 토큰 없이 보호된 엔드포인트 접근
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      // Then: 에러 응답 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail access with invalid JWT token (실패 - 잘못된 토큰)', async () => {
      // When: 잘못된 JWT 토큰으로 접근
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      // Then: 에러 응답 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should access protected endpoint with facility JWT token (성공 - 시설 토큰)', async () => {
      // Given: 테스트 시설 계정 생성 및 로그인
      const hashedPassword = await bcrypt.hash(testFacility.password, 10);
      await facilityRepository.save({
        ...testFacility,
        password: hashedPassword,
        isActive: true,
      });

      // 로그인하여 토큰 획득
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/facility/login')
        .send({
          username: testFacility.username,
          password: testFacility.password,
        });

      const accessToken = loginResponse.body.data.access_token;

      // When: JWT 토큰으로 보호된 엔드포인트 접근
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Then: 사용자 정보 응답 검증
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        username: testFacility.username,
        name: testFacility.managerName,
        type: 'facility',
      });
      expect(response.body.data).toHaveProperty('facilityId');
      expect(response.body.data).toHaveProperty(
        'facilityName',
        testFacility.facilityName,
      );
    });
  });
});
