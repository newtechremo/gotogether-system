# GoTogether 시스템 현재 상황

## 📅 최종 업데이트: 2025-10-21

## 🚀 서버 상태

### Backend
- **포트**: 3002
- **상태**: ✅ 실행 중
- **URL**: http://localhost:3002
- **Swagger**: http://localhost:3002/api
- **로그**: `/tmp/backend.log`

### Frontend (Admin)
- **포트**: 5173
- **상태**: ✅ 실행 중
- **URL**: http://localhost:5173
- **로그**: `/tmp/admin-frontend.log`

## ✅ 최근 완료된 작업

### 1. 시설관리자 프로필 수정 및 비밀번호 변경 기능 (2025-10-21)
- **백엔드 API**:
  - `GET /facility/profile` - 시설관리자 본인 프로필 조회
  - `PUT /facility/profile` - 시설관리자 본인 프로필 수정 (담당자명, 전화번호, 주소)
  - `PUT /facility/profile/password` - 시설관리자 비밀번호 변경
  - `POST /admin/facilities/:id/reset-password` - 전체관리자의 시설 비밀번호 재설정

- **구현 파일**:
  - `backend/src/common/dto/facility-profile.dto.ts` - 프로필 DTO (조회, 수정, 비밀번호 변경)
  - `backend/src/common/dto/reset-facility-password.dto.ts` - 비밀번호 재설정 DTO
  - `backend/src/common/utils/password-generator.ts` - 안전한 랜덤 비밀번호 생성 유틸리티
  - `backend/src/facility/facility-profile.controller.ts` - 시설관리자 프로필 컨트롤러
  - `backend/src/facility/facility.service.ts` - 프로필 관련 Service 메서드 추가
  - `backend/src/admin/admin.controller.ts` - 비밀번호 재설정 엔드포인트 추가
  - `backend/src/admin/admin.service.ts` - 비밀번호 재설정 로직 구현

- **기능**:
  - 시설관리자가 자신의 프로필 정보 조회 및 수정 가능
  - 비밀번호 변경 시 현재 비밀번호 확인 필수
  - 전체관리자가 시설 비밀번호를 재설정 가능 (자동 생성 또는 직접 입력)
  - 비밀번호 자동 생성 시 12자 랜덤 생성 (영문 대소문자 + 숫자 + 특수문자)

### 2. 실시간 대여 현황 날짜 필터링 기능 (2025-10-21)
- **백엔드**:
  - `backend/src/kiosk/kiosk.controller.ts` - `date` 쿼리 파라미터 추가
  - `backend/src/kiosk/kiosk.service.ts` - 날짜별 대여 상태 계산 로직 구현
  - 특정 날짜의 대여 기록 조회 및 장비 상태 반환

- **프론트엔드**:
  - `frontend/admin/lib/hooks/useKiosks.ts` - `date` 파라미터 지원 추가
  - `frontend/admin/components/tabs/RealtimeRentalsTab.tsx` - 날짜 선택 기능 연동

- **기능**:
  - 관리자가 특정 날짜를 선택하면 해당 날짜의 대여 현황을 볼 수 있음
  - 과거 날짜 선택 시 historical data 조회 가능

## 📋 진행 중인 작업

현재 진행 중인 작업 없음

## 🎯 대기 중인 작업 (우선순위 순)

### HIGH PRIORITY

#### 1. 시설관리자 프로필 수정 페이지 개발
**목적**: 시설관리자가 자신의 프로필 정보를 직접 수정할 수 있는 기능 제공

**필요한 작업**:
- [ ] **백엔드 API 개발**
  - `PUT /facility/profile` - 시설관리자 본인 프로필 수정 API
  - `GET /facility/profile` - 현재 로그인한 시설관리자 정보 조회 API
  - 수정 가능 항목: 이름, 전화번호, 비밀번호
  - JWT에서 facilityId 추출하여 본인 정보만 수정 가능하도록 제한

- [ ] **프론트엔드 개발**
  - 시설관리자 포털에 프로필 수정 페이지 생성
  - 경로: `/facility/profile` 또는 `/facility/settings`
  - 폼 구성: 이름, 전화번호, 비밀번호 변경
  - 비밀번호 변경 시 현재 비밀번호 확인 필수

**관련 파일**:
- Backend: `backend/src/facility/facility.controller.ts`, `backend/src/facility/facility.service.ts`
- Frontend: `frontend/facility/` (시설관리자 포털 - 경로 확인 필요)

#### 2. 전체관리자의 시설관리에서 비밀번호 재설정 기능
**목적**: 전체관리자가 시설관리자의 비밀번호를 재설정할 수 있는 기능 제공 (비밀번호 분실 시)

**필요한 작업**:
- [ ] **백엔드 API 개발**
  - `POST /admin/facilities/:id/reset-password` - 시설 비밀번호 재설정 API
  - 새 비밀번호 자동 생성 또는 관리자가 지정
  - 비밀번호 재설정 후 응답으로 새 비밀번호 반환 (1회만 표시)

- [ ] **프론트엔드 개발**
  - 관리자 포털의 시설 관리 페이지에 "비밀번호 재설정" 버튼 추가
  - 모달 팝업으로 새 비밀번호 입력 또는 자동 생성
  - 재설정 후 새 비밀번호를 관리자에게 표시 (복사 가능)
  - 확인 다이얼로그로 실수 방지

**관련 파일**:
- Backend: `backend/src/admin/admin.controller.ts`, `backend/src/facilities/facilities.service.ts`
- Frontend: `frontend/admin/components/tabs/FacilityManagementTab.tsx`

### MEDIUM PRIORITY

#### 3. 실시간 대여 현황 개선
- [ ] 실시간 자동 새로고침 기능 추가 (WebSocket 또는 polling)
- [ ] 대여율 차트/그래프 추가
- [ ] 날짜 범위 선택 기능 (시작일~종료일)

#### 4. 키오스크 상세 페이지 개선
- [ ] 키오스크별 대여 히스토리 차트
- [ ] 장비별 사용률 통계

## 🗂️ 프로젝트 구조

```
/mnt/d/work/node/gotogether-system/
├── backend/                 # NestJS 백엔드
│   ├── src/
│   │   ├── admin/          # 전체관리자 모듈
│   │   ├── auth/           # 인증 모듈
│   │   ├── facility/       # 시설관리자 모듈
│   │   ├── kiosk/          # 키오스크 모듈
│   │   └── common/         # 공통 모듈
│   └── package.json
├── frontend/
│   └── admin/              # 전체관리자 포털 (Next.js)
│       ├── app/
│       ├── components/
│       └── lib/
├── docs/                   # 프로젝트 문서
│   ├── api.md             # API 명세
│   └── erd.md             # 데이터베이스 ERD
├── CLAUDE.md              # Claude 작업 가이드
├── CURRENT_STATUS.md      # 현재 상황 (이 파일)
└── TODO.md                # 할 일 목록
```

## 🔑 주요 엔드포인트

### 인증
- `POST /auth/admin/login` - 전체관리자 로그인
- `POST /auth/facility/login` - 시설관리자 로그인

### 키오스크 관리
- `GET /admin/kiosks/locations?page=1&limit=10&date=YYYY-MM-DD` - 키오스크 목록 (날짜 필터링 지원)
- `GET /admin/kiosks/locations/:id` - 키오스크 상세
- `GET /admin/kiosks/rentals/current` - 현재 대여 목록
- `GET /admin/kiosks/rentals/overdue` - 연체 목록

### 시설 관리
- `GET /facilities` - 시설 목록
- `GET /facilities/:id` - 시설 상세
- `POST /facilities` - 시설 생성
- `PUT /facilities/:id` - 시설 수정
- `DELETE /facilities/:id` - 시설 삭제

## 🧪 테스트 계정

### 전체관리자
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `super_admin`

### 시설관리자 (예시)
- **Username**: `facility`
- **Password**: (시설별 비밀번호)
- **Facility ID**: 2

## 📝 개발 노트

### 날짜 필터링 로직
- 특정 날짜의 대여 상태 계산:
  1. 해당 날짜 23:59:59까지를 targetDate로 설정
  2. `rental.rentalDatetime <= targetDate` AND (`rental.actualReturnDatetime IS NULL` OR `rental.actualReturnDatetime > targetDate`)
  3. 조건을 만족하면 해당 장비는 그 날짜에 "대여중"으로 표시

### 인증 시스템
- JWT 기반 인증
- 전체관리자와 시설관리자는 별도 테이블 (`admin_users`, `facilities`)
- 토큰 유효기간: 24시간 (86400초)

## 🐛 알려진 이슈

현재 알려진 이슈 없음

## 📚 참고 문서

- API 명세: `docs/api.md`
- 데이터베이스 스키마: `docs/erd.md`
- 프로젝트 가이드: `CLAUDE.md`
