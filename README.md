# GoTogether System

시각장애인을 위한 보조기기 대여 관리 플랫폼

## 프로젝트 개요

GoTogether는 한국시각장애인연합회가 운영하는 보조기기 대여 관리 시스템입니다. 이 시스템은 세 가지 독립적인 서브시스템으로 구성됩니다:

1. **Kiosk System** - 영화관 등에서의 자동화된 보조기기 대여/반납
2. **Admin System** - 한국시각장애인연합회의 중앙 관리 시스템
3. **Facility Manager System** - 100개 이상의 네트워크 시설에서의 독립적인 보조기기 관리

## 기술 스택

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: TypeORM
- **Database**: MySQL
- **Port**: 3002

### Frontend
- **Framework**: Next.js (React 19)
- **Styling**: Tailwind CSS
- **Admin Portal**: Port 5173
- **Facility Portal**: Port 5174

## 프로젝트 구조

```
gotogether-system/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── admin/          # 관리자 모듈
│   │   ├── facility/       # 시설 관리 모듈
│   │   ├── kiosk/          # 키오스크 모듈
│   │   ├── entities/       # TypeORM 엔티티
│   │   └── common/         # 공통 모듈
│   └── package.json
├── frontend/
│   ├── admin/              # 관리자 포털 (Next.js)
│   └── facility/           # 시설 관리자 포털 (Next.js)
├── docs/                   # 프로젝트 문서
└── scripts/                # 배포 스크립트
```

## 시작하기

### 필수 요구사항

- Node.js 22.x
- npm
- MySQL 5.7+

### 설치 및 실행

#### Backend 실행

```bash
cd backend
npm install
npm run start:dev
```

백엔드 서버는 http://localhost:3002 에서 실행됩니다.
Swagger 문서: http://localhost:3002/api

#### Admin Frontend 실행

```bash
cd frontend/admin
npm install
npm run dev
```

관리자 포털은 http://localhost:5173 에서 실행됩니다.

#### Facility Frontend 실행

```bash
cd frontend/facility
npm install
npm run dev
```

시설 관리자 포털은 http://localhost:5174 에서 실행됩니다.

### 개발 서버 한번에 실행

```bash
./scripts/start-development.sh
```

## 환경 변수 설정

### Backend (.env)

```env
NODE_ENV=development
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=gotogether_user
DB_PASSWORD=your_password
DB_NAME=gotogether

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=1h
JWT_REFRESH_TOKEN_EXPIRES=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

## 주요 기능

### Admin System
- 대시보드 및 통계
- 전체 시설 관리
- 키오스크 위치 관리
- 장기 미반납자 관리
- 시설 비밀번호 재설정

### Facility System
- 보조기기 대여/반납 관리
- 재고 관리
- 수리 이력 관리
- 통계 및 보고서

### Kiosk System
- OTP 기반 사용자 인증
- 실시간 보조기기 대여
- 자동 반납 처리
- 하드웨어 통합 (보관함 제어)

## 데이터베이스 스키마

상세한 ERD 및 테이블 정의는 `docs/erd.md`를 참조하세요.

## API 문서

전체 API 명세는 `docs/api.md`를 참조하세요.

개발 서버 실행 시 Swagger UI를 통해 대화형 API 문서를 확인할 수 있습니다:
http://localhost:3002/api

## 배포

AWS EC2 기반 배포 가이드는 `wsl_cicd_guide.md`를 참조하세요.

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend (Admin)
cd frontend/admin
npm run build
npm start

# Frontend (Facility)
cd frontend/facility
npm run build
npm start
```

## 테스트

```bash
# Backend 테스트
cd backend
npm run test
npm run test:e2e

# Frontend 테스트
cd frontend/admin
npm run test:e2e
```

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 기여

내부 개발팀 전용 프로젝트입니다.

## 문의

프로젝트 관련 문의: newtechremo@gmail.com
