# GoTogether Backend - 인증 모듈 구현 완료

## 구현 내용

### 1. 설치된 패키지
- `@nestjs/jwt`: JWT 인증
- `bcrypt`: 비밀번호 해싱
- `@types/bcrypt`, `@types/passport-jwt`: TypeScript 타입 정의

### 2. 생성된 파일 구조

```
backend/src/
├── config/
│   ├── database.config.ts       # TypeORM 데이터베이스 설정
│   └── jwt.config.ts             # JWT 설정
├── entities/
│   ├── admin-user.entity.ts     # 전체관리자 Entity
│   └── facility.entity.ts        # 시설 Entity
├── common/
│   ├── dto/
│   │   ├── login.dto.ts          # 로그인 DTO
│   │   └── auth-response.dto.ts  # 응답 DTO
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     # JWT 인증 Guard
│   │   └── roles.guard.ts        # 권한 검증 Guard
│   └── decorators/
│       ├── roles.decorator.ts    # Roles 데코레이터
│       ├── public.decorator.ts   # Public 데코레이터
│       └── user.decorator.ts     # User 데코레이터
├── auth/
│   ├── auth.module.ts            # Auth 모듈
│   ├── auth.service.ts           # Auth 서비스
│   ├── auth.service.spec.ts      # Auth 서비스 테스트
│   ├── auth.controller.ts        # Auth 컨트롤러
│   └── strategies/
│       └── jwt.strategy.ts       # JWT Strategy
├── app.module.ts                 # App 모듈 (TypeORM + Auth 추가)
└── main.ts                       # 메인 파일 (Swagger, Validation 추가)
```

### 3. 구현된 API 엔드포인트

#### 전체관리자 로그인
```http
POST /auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "관리자",
      "role": "super_admin",
      "permissions": ["all"]
    },
    "expires_in": 3600
  }
}
```

#### 시설관리자 로그인
```http
POST /auth/facility/login
Content-Type: application/json

{
  "username": "facility_seoul_01",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "facility_seoul_01",
      "name": "시설관리자",
      "facilityId": 1,
      "facilityName": "서울시각장애인복지관"
    },
    "expires_in": 3600
  }
}
```

#### 현재 사용자 정보 조회
```http
GET /auth/me
Authorization: Bearer {access_token}
```

### 4. 주요 기능

#### 인증 및 권한 시스템
- **JWT 기반 인증**: Access Token (24시간), Refresh Token (7일)
- **bcrypt 비밀번호 해싱**: 10 rounds
- **역할 기반 접근 제어**: super_admin, admin, facility

#### Guards
- **JwtAuthGuard**: JWT 토큰 검증
- **RolesGuard**: 역할 기반 접근 제어
- **@Public()**: 인증 없이 접근 가능한 엔드포인트 표시

#### Decorators
- **@Roles('super_admin', 'admin')**: 특정 역할만 접근 가능
- **@User()**: 현재 로그인한 사용자 정보 추출
- **@Public()**: 공개 엔드포인트 표시

### 5. 환경 변수 설정

`.env` 파일 생성 (`.env.example` 참고):

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=gotogether
DB_PASSWORD=password
DB_NAME=gotogether_db

# JWT
JWT_SECRET=gotogether-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### 6. 실행 방법

#### 개발 모드 실행
```bash
cd backend
npm run start:dev
```

#### 테스트 실행
```bash
# 모든 테스트 실행
npm run test

# Auth 모듈 테스트만 실행
npm run test:watch auth

# 커버리지 확인
npm run test:cov
```

#### Swagger 문서 확인
```
http://localhost:3000/api
```

### 7. 데이터베이스 마이그레이션

**주의**: TypeORM `synchronize: true`는 개발 환경에서만 사용됩니다. 프로덕션에서는 마이그레이션 파일을 사용해야 합니다.

#### 초기 데이터 Seeding 필요
데이터베이스 연결 후 다음 작업이 필요합니다:
1. Super Admin 계정 생성
2. 테스트용 시설 데이터 생성
3. 코드 테이블 데이터 삽입 (지역, 장애유형, 대여목적)

### 8. 다음 단계

#### DB-008: 초기 데이터 Seeding
- [ ] Seeder 스크립트 생성
- [ ] Super Admin 계정 생성
- [ ] 테스트용 시설 데이터 생성

#### FAC-001~005: 시설 관리 API
- [ ] 시설 목록 조회
- [ ] 시설 등록
- [ ] 시설 수정
- [ ] 시설 삭제

#### KDEV-001~005: 키오스크 장비 관리
- [ ] 키오스크 장비 Entity 생성
- [ ] 키오스크 장비 CRUD API

### 9. 테스트 커버리지

Auth Service 테스트:
- ✅ Admin 로그인 성공
- ✅ Admin 로그인 실패 (잘못된 사용자명)
- ✅ Admin 로그인 실패 (잘못된 비밀번호)
- ✅ Facility 로그인 성공
- ✅ Facility 로그인 실패
- ✅ 비밀번호 해싱
- ✅ 비밀번호 비교

### 10. API 에러 코드

| Code | Description | HTTP Status |
|------|------------|-------------|
| AUTH_001 | 인증 실패 (Invalid credentials) | 401 |
| AUTH_002 | 토큰 만료 | 401 |
| AUTH_003 | 권한 없음 | 403 |

### 11. 보안 고려사항

- ✅ 비밀번호 bcrypt 해싱
- ✅ JWT 토큰 기반 인증
- ✅ 환경변수로 Secret 관리
- ✅ CORS 설정
- ✅ Validation Pipe 활성화
- ⚠️ Rate Limiting (향후 구현 필요)
- ⚠️ Refresh Token Rotation (향후 구현 필요)

## 트러블슈팅

### 데이터베이스 연결 오류
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user...
```
**해결**: `.env` 파일의 DB 설정 확인

### JWT 토큰 검증 오류
```
UnauthorizedException: User not found or inactive
```
**해결**: 토큰이 유효한지, 사용자가 활성화 상태인지 확인

## 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [Passport JWT 전략](https://www.passportjs.org/packages/passport-jwt/)
- [프로젝트 ERD 문서](../docs/erd.md)
- [프로젝트 API 문서](../docs/api.md)
