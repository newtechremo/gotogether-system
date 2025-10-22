# 🎯 GoTogether 개발 백로그

> 최종 업데이트: 2025-10-15
> 프로젝트 매니저: Claude Code

## 📋 현재 상태 요약

### 완료된 작업
- ✅ 프로젝트 구조 설계 (NestJS Backend + Next.js Frontends)
- ✅ ERD 설계 및 문서화 (10개 테이블)
- ✅ API 명세 문서화 (70+ 엔드포인트)
- ✅ Frontend/Facility UI 목업 완성 (대시보드, 장비관리, 대여/반납, 고장신고, 기록조회)
- ✅ Frontend/Admin UI 목업 일부 완성 (키오스크 현황 페이지)

### 작업 필요
- ❌ Backend API 구현 (0%)
- ❌ Database 마이그레이션 및 초기 데이터
- ❌ Frontend-Backend 연동
- ❌ 인증/권한 시스템
- ❌ 테스트 코드 작성

---

## 🔴 우선순위 1 - 기반 인프라 (1-2주)

### 1.1 Database 설정 및 마이그레이션
- [ ] **DB-001**: MySQL 데이터베이스 생성 및 설정
  - Character Set: utf8mb4
  - Collation: utf8mb4_unicode_ci
  - InnoDB 엔진 설정
- [ ] **DB-002**: TypeORM 설정 및 Entity 정의
  - AdminUser Entity
  - Facility Entity
  - 공통 Base Entity (created_at, updated_at)
- [ ] **DB-003**: 키오스크 관련 Entity 생성
  - KioskDevice Entity
  - KioskRental Entity
- [ ] **DB-004**: 시설관리자 관련 Entity 생성
  - FacilityDevice Entity
  - FacilityDeviceItem Entity
  - FacilityRental Entity
  - FacilityRentalDevice Entity
  - FacilityRepair Entity
- [ ] **DB-005**: 마스터 데이터 Entity 생성
  - RegionCode Entity
  - DisabilityType Entity
  - RentalPurpose Entity
- [ ] **DB-006**: 로그/통계 Entity 생성
  - SystemLog Entity
  - DailyStatistics Entity
- [ ] **DB-007**: Migration 스크립트 작성
  - 테이블 생성 migration
  - 인덱스 생성 migration
  - 트리거 생성 migration (rental_weekday 자동 설정)
- [ ] **DB-008**: 초기 데이터 Seeding
  - Super Admin 계정 생성
  - 지역 코드 데이터 삽입 (17개 시/도)
  - 장애유형 데이터 삽입
  - 대여목적 데이터 삽입
  - 테스트용 시설 데이터 생성 (3-5개)

### 1.2 인증 및 권한 시스템
- [ ] **AUTH-001**: JWT 인증 모듈 구현
  - JWT Strategy 설정
  - Access Token / Refresh Token 발급
  - Token 검증 Guard
- [ ] **AUTH-002**: 전체관리자 로그인 API
  - `POST /admin/auth/login`
  - bcrypt 비밀번호 검증
  - JWT 토큰 발급
  - 로그인 로그 기록
- [ ] **AUTH-003**: 시설관리자 로그인 API
  - `POST /facility/auth/login`
  - facilities 테이블 username/password 검증
  - facility_id 포함 JWT 발급
- [ ] **AUTH-004**: 권한 검증 Guard 구현
  - AdminGuard (super_admin, admin)
  - FacilityGuard (facility_id 스코핑)
  - Role-based access control
- [ ] **AUTH-005**: 키오스크 OTP 인증 시스템
  - `POST /kiosk/auth/request-otp`
  - SMS 발송 연동 (외부 API 또는 Mock)
  - OTP 검증 및 임시 토큰 발급
  - `POST /kiosk/auth/verify-otp`

---

## 🟡 우선순위 2 - 핵심 비즈니스 로직 (2-3주)

### 2.1 시설 관리 (전체관리자)
- [ ] **FAC-001**: 시설 목록 조회 API
  - `GET /admin/facilities`
  - 페이지네이션 지원
  - 검색 필터 (시설명, 시설코드)
  - 활성화 상태 필터
- [ ] **FAC-002**: 시설 상세 조회 API
  - `GET /admin/facilities/:id`
  - 시설 정보 + 장비 현황 + 대여 통계
- [ ] **FAC-003**: 시설 등록 API
  - `POST /admin/facilities`
  - 시설관리자 계정 자동 생성 (username/password)
  - 중복 체크 (facility_code, username)
  - SystemLog 기록
- [ ] **FAC-004**: 시설 수정 API
  - `PUT /admin/facilities/:id`
  - 시설 정보 업데이트
  - 비밀번호 변경 옵션
- [ ] **FAC-005**: 시설 삭제/비활성화 API
  - `DELETE /admin/facilities/:id`
  - Soft delete (is_active = false)
  - 관련 데이터 존재 여부 검증

### 2.2 키오스크 장비 관리
- [ ] **KDEV-001**: 키오스크 장비 목록 조회
  - `GET /admin/kiosks`
  - 키오스크별 장비 현황 조회
  - 대여/반납 상태 집계
- [ ] **KDEV-002**: 키오스크 장비 상세 조회
  - `GET /admin/kiosks/:kiosk_id/detail`
  - 개별 장비 상태
  - 현재 대여 정보
  - 유지보수 이력
- [ ] **KDEV-003**: 키오스크 장비 등록
  - `POST /admin/kiosks/devices`
  - 시리얼 번호 중복 체크
  - 박스 번호 할당
  - 시설 연결
- [ ] **KDEV-004**: 키오스크 장비 수정
  - `PUT /admin/kiosks/devices/:id`
  - 상태 변경 (available, maintenance, broken)
  - 비고 업데이트
- [ ] **KDEV-005**: 키오스크 장비 삭제
  - `DELETE /admin/kiosks/devices/:id`
  - 대여 기록 존재 여부 검증

### 2.3 키오스크 대여/반납 프로세스
- [ ] **KRENT-001**: 대여 가능 장비 조회
  - `GET /kiosk/devices/available?kiosk_id={id}`
  - 장비 유형별 가용 수량
  - 박스 번호 정보
  - 실시간 상태 반영
- [ ] **KRENT-002**: 장비 대여 처리
  - `POST /kiosk/rentals/create`
  - 장비 상태 변경 (available → rented)
  - 대여 번호 자동 생성
  - 박스 열기 명령 (하드웨어 연동 또는 Mock)
  - DailyStatistics 업데이트
- [ ] **KRENT-003**: 활성 대여 조회
  - `GET /kiosk/rentals/active?phone={phone}`
  - 전화번호로 대여 내역 조회
  - 반납 가능 장비 목록
- [ ] **KRENT-004**: 장비 반납 처리
  - `POST /kiosk/rentals/return`
  - NFC 태그 검증
  - 장비 상태 변경 (rented → available)
  - 대여 기록 업데이트 (actual_return_datetime)
  - 대여 시간 계산
- [ ] **KRENT-005**: 키오스크 상태 동기화
  - `POST /kiosk/status/sync`
  - 박스 상태 업데이트
  - 네트워크 상태 모니터링

### 2.4 시설 장비 관리 (시설관리자)
- [ ] **FDEV-001**: 시설 장비 목록 조회
  - `GET /facility/devices`
  - facility_id 필터링 (JWT에서 추출)
  - 장비 유형별 집계 (total, available, rented, broken)
  - 개별 장비 아이템 포함
- [ ] **FDEV-002**: 신규 장비 등록
  - `POST /facility/devices/register`
  - FacilityDevice + FacilityDeviceItem 생성
  - 장비 코드 중복 체크
  - total_quantity, available_quantity 자동 증가
- [ ] **FDEV-003**: 장비 정보 수정
  - `PUT /facility/devices/:id`
  - 장비 코드, 시리얼 번호 수정
  - 메모 업데이트
- [ ] **FDEV-004**: 장비 상태 변경
  - `PATCH /facility/devices/:id/status`
  - 상태 변경 (available, rented, broken, maintenance)
  - 수량 자동 조정 (available_quantity, broken_quantity)
- [ ] **FDEV-005**: 장비 삭제
  - `DELETE /facility/devices/:id`
  - 대여 기록 검증
  - 수량 자동 감소

### 2.5 시설 대여/반납 관리 (시설관리자)
- [ ] **FRENT-001**: 대여 등록
  - `POST /facility/rentals/create`
  - 개인/단체 대여 구분
  - 장비 선택 및 수량 검증
  - FacilityRental + FacilityRentalDevice 생성
  - 장비 상태 변경 (available → rented)
  - 수량 업데이트 (available_quantity 감소, rented_quantity 증가)
  - rental_weekday 자동 설정 (Trigger)
  - rental_period 자동 계산
- [ ] **FRENT-002**: 현재 대여 목록 조회
  - `GET /facility/rentals/current`
  - 대여중 상태 필터링
  - 연체 여부 표시
  - 장비 상세 정보 포함
- [ ] **FRENT-003**: 대여 기록 조회
  - `GET /facility/rentals/history`
  - 날짜 범위 필터
  - 대여자명 검색
  - 대여 유형 필터 (개인/단체)
  - 페이지네이션
- [ ] **FRENT-004**: 대여 상세 조회
  - `GET /facility/rentals/:id`
  - 대여자 정보
  - 대여 장비 목록
  - 반납 상태
- [ ] **FRENT-005**: 장비 반납 처리
  - `POST /facility/rentals/:id/return`
  - 일부 반납 지원 (특정 장비만 반납)
  - 장비 상태 변경 (rented → available)
  - 수량 업데이트
  - actual_return_date 기록
  - 모든 장비 반납 시 status = '반납완료'

### 2.6 고장 신고 관리 (시설관리자)
- [ ] **REP-001**: 고장 신고 등록
  - `POST /facility/repairs/report`
  - FacilityRepair 생성
  - 장비 상태 변경 (broken)
  - broken_quantity 증가
  - available_quantity 감소
- [ ] **REP-002**: 고장 신고 목록 조회
  - `GET /facility/repairs`
  - 상태별 필터 (수리접수, 수리중, 수리완료)
  - 장비 유형 필터
- [ ] **REP-003**: 고장 신고 상세 조회
  - `GET /facility/repairs/:id`
  - 신고 내용
  - 수리 진행 상황
- [ ] **REP-004**: 수리 상태 업데이트
  - `PATCH /facility/repairs/:id/status`
  - 상태 변경 (수리접수 → 수리중 → 수리완료)
  - 수리 비용, 내역 기록
- [ ] **REP-005**: 수리 완료 처리
  - `POST /facility/repairs/:id/complete`
  - 장비 상태 변경 (broken → available 또는 maintenance)
  - broken_quantity 감소
  - available_quantity 증가

---

## 🟢 우선순위 3 - 통계 및 관리 기능 (1-2주)

### 3.1 대여 현황 모니터링 (전체관리자)
- [ ] **MON-001**: 실시간 대여 현황 조회
  - `GET /admin/rentals/realtime`
  - 키오스크별 실시간 대여 현황
  - 오늘 대여/반납 집계
  - 현재 대여 중인 장비 목록
- [ ] **MON-002**: 연체 현황 조회
  - `GET /admin/rentals/overdue`
  - 키오스크 연체 (expected_return_datetime 초과)
  - 시설 연체 (return_date 초과)
  - 경과 시간/일수 계산
  - 심각도 레벨 표시 (warning, critical, urgent)
- [ ] **MON-003**: 시설별 통계 조회
  - `GET /admin/statistics/facilities`
  - 시설별 대여/반납 통계
  - 장비별 이용률
  - 월간/주간 추이

### 3.2 통계 및 리포트
- [ ] **STAT-001**: 일일 통계 조회
  - `GET /statistics/daily`
  - 특정 날짜 또는 날짜 범위
  - 시설별, 시스템별 집계
  - 장비 유형별 대여 수
- [ ] **STAT-002**: 월간 통계 조회
  - `GET /statistics/monthly`
  - 월별 집계
  - 전월 대비 증감률
- [ ] **STAT-003**: 통계 자동 집계 Job
  - 일일 통계 자동 생성 (매일 자정)
  - DailyStatistics 테이블 업데이트
  - 키오스크/시설 통계 분리
- [ ] **STAT-004**: 대시보드 KPI API
  - `GET /statistics/kpi`
  - 총 대여 건수
  - 현재 대여 중인 장비
  - 가용 장비 수
  - 연체 건수
  - 고장 장비 수

### 3.3 원격 제어 (전체관리자)
- [ ] **REMOTE-001**: 키오스크 박스 원격 열기
  - `POST /admin/kiosks/:kiosk_id/remote-control`
  - 박스 번호 지정
  - 하드웨어 API 연동
  - 실행 로그 기록
- [ ] **REMOTE-002**: 장비 강제 반납
  - `POST /admin/rentals/:id/force-return`
  - 관리자 권한 검증
  - 장비 상태 강제 변경
  - 사유 기록

### 3.4 시스템 로그 관리
- [ ] **LOG-001**: 시스템 로그 조회
  - `GET /admin/logs`
  - 로그 타입 필터 (login, rental, return, error)
  - 시스템 구분 필터 (kiosk, admin, facility)
  - 날짜 범위 필터
  - 페이지네이션
- [ ] **LOG-002**: 에러 로그 모니터링
  - `GET /admin/logs/errors`
  - 최근 에러 목록
  - 심각도별 필터링
- [ ] **LOG-003**: 로그 자동 기록 Interceptor
  - 모든 API 요청/응답 로그
  - IP 주소, User Agent 기록
  - 에러 발생 시 자동 로그

---

## 🔵 우선순위 4 - Frontend 연동 및 고도화 (2-3주)

### 4.1 Frontend/Facility 백엔드 연동
- [ ] **FE-FAC-001**: API 클라이언트 설정
  - Axios 또는 Fetch 설정
  - Base URL 환경변수 설정
  - JWT 토큰 자동 포함
  - 에러 핸들링
- [ ] **FE-FAC-002**: 로그인 페이지 구현
  - 로그인 폼
  - JWT 토큰 저장 (LocalStorage 또는 Cookie)
  - 로그인 실패 처리
- [ ] **FE-FAC-003**: 대시보드 데이터 연동
  - KPI 데이터 fetch
  - 현재 대여 목록 fetch
  - 장비 현황 fetch
- [ ] **FE-FAC-004**: 장비 관리 페이지 연동
  - 장비 목록 조회
  - 장비 등록 (Dialog → API 호출)
  - 장비 수정
  - 장비 삭제
- [ ] **FE-FAC-005**: 대여/반납 페이지 연동
  - 대여 등록 폼 → API 호출
  - 반납 처리
  - 유효성 검증
- [ ] **FE-FAC-006**: 고장신고 페이지 연동
  - 고장 신고 등록
  - 신고 목록 조회
  - 상태 업데이트
- [ ] **FE-FAC-007**: 기록 조회 페이지 연동
  - 대여 기록 조회
  - 날짜 필터링
  - 검색 기능
- [ ] **FE-FAC-008**: 전화번호 마스킹 처리
  - 010-****-**** 형식으로 표시

### 4.2 Frontend/Admin 페이지 완성 및 연동
- [ ] **FE-ADM-001**: 로그인 페이지 구현
  - 관리자 로그인 폼
  - JWT 토큰 관리
- [ ] **FE-ADM-002**: 키오스크 현황 페이지 연동
  - 목업 데이터 제거
  - 실제 API 연동 (`GET /admin/kiosks`)
  - 실시간 데이터 갱신
- [ ] **FE-ADM-003**: 키오스크 상세 페이지 구현
  - 장비별 상태 표시
  - 현재 대여 정보
  - 유지보수 이력
- [ ] **FE-ADM-004**: 시설 관리 페이지 구현
  - 시설 목록 테이블
  - 시설 등록 Dialog
  - 시설 수정 Dialog
  - 시설 삭제 확인
- [ ] **FE-ADM-005**: 실시간 대여 현황 페이지 구현
  - 키오스크 대여 현황
  - 시설 대여 현황
  - 연체 알림 표시
- [ ] **FE-ADM-006**: 연체 관리 페이지 구현
  - 연체 목록 테이블
  - 연체 심각도 표시
  - 원격 제어 기능 (박스 열기)
- [ ] **FE-ADM-007**: 통계 대시보드 구현
  - 일일/월간 통계 차트
  - 시설별 이용률 차트
  - 장비별 대여 추이
- [ ] **FE-ADM-008**: 시스템 로그 페이지 구현
  - 로그 목록 테이블
  - 필터링 기능
  - 에러 로그 강조 표시

### 4.3 키오스크 UI (선택적, 하드웨어 연동 시)
- [ ] **FE-KIOSK-001**: OTP 인증 화면
  - 전화번호 입력
  - OTP 입력
  - 타이머 표시
- [ ] **FE-KIOSK-002**: 장비 선택 화면
  - 가용 장비 표시
  - 장비 설명
- [ ] **FE-KIOSK-003**: 대여 확인 화면
  - 대여 정보 확인
  - 약관 동의
- [ ] **FE-KIOSK-004**: 반납 화면
  - NFC 태그 대기
  - 반납 완료 메시지

---

## 🟣 우선순위 5 - 테스트 및 품질 보증 (1-2주)

### 5.1 Unit Tests
- [ ] **TEST-001**: 인증 서비스 단위 테스트
  - 로그인 성공/실패 시나리오
  - JWT 발급 검증
  - 비밀번호 해싱 검증
- [ ] **TEST-002**: 대여 서비스 단위 테스트
  - 대여 생성 로직
  - 장비 상태 변경
  - 수량 계산
- [ ] **TEST-003**: 통계 서비스 단위 테스트
  - 집계 계산
  - 날짜 필터링

### 5.2 E2E Tests
- [ ] **TEST-E2E-001**: 전체관리자 워크플로우
  - 로그인 → 시설 등록 → 키오스크 조회
- [ ] **TEST-E2E-002**: 시설관리자 워크플로우
  - 로그인 → 장비 등록 → 대여 등록 → 반납
- [ ] **TEST-E2E-003**: 키오스크 워크플로우
  - OTP 인증 → 대여 → 반납

### 5.3 Integration Tests
- [ ] **TEST-INT-001**: Database 트랜잭션 테스트
  - 대여 생성 시 트랜잭션 롤백 검증
- [ ] **TEST-INT-002**: 권한 테스트
  - 시설관리자가 다른 시설 데이터 접근 불가 검증

---

## 🟠 우선순위 6 - 배포 및 운영 (1주)

### 6.1 배포 준비
- [ ] **DEPLOY-001**: 환경변수 설정
  - Production/Development 분리
  - Database 연결 정보
  - JWT Secret
  - SMS API Key
- [ ] **DEPLOY-002**: Docker 설정
  - Backend Dockerfile
  - Frontend Dockerfile
  - Docker Compose 설정
- [ ] **DEPLOY-003**: CI/CD 파이프라인
  - GitHub Actions 설정
  - 자동 테스트 실행
  - 자동 빌드 및 배포
- [ ] **DEPLOY-004**: 모니터링 설정
  - 에러 추적 (Sentry)
  - 로그 수집
  - 성능 모니터링

### 6.2 문서화
- [ ] **DOC-001**: API 문서 자동 생성
  - Swagger/OpenAPI 설정
  - DTO 문서화
  - 예제 요청/응답
- [ ] **DOC-002**: 배포 가이드 작성
  - 서버 설정 방법
  - 환경변수 설명
  - 데이터베이스 마이그레이션
- [ ] **DOC-003**: 운영 매뉴얼 작성
  - 관리자 사용 매뉴얼
  - 시설관리자 사용 매뉴얼
  - 문제 해결 가이드

---

## 📊 진행 상황 통계

### 전체 진행률
- **완료**: 5개 항목 (문서 및 목업)
- **진행 중**: 0개 항목
- **대기**: 150+ 개 항목

### 우선순위별 분포
- 🔴 **우선순위 1**: 29개 작업 (인프라)
- 🟡 **우선순위 2**: 36개 작업 (비즈니스 로직)
- 🟢 **우선순위 3**: 17개 작업 (통계/관리)
- 🔵 **우선순위 4**: 20개 작업 (Frontend)
- 🟣 **우선순위 5**: 9개 작업 (테스트)
- 🟠 **우선순위 6**: 7개 작업 (배포/문서)

**총 작업**: ~120개 작업

---

## 🎯 다음 스프린트 계획

### Sprint 1 (1주차): Database & Auth
- DB-001 ~ DB-008: Database 설정 및 Entity 생성
- AUTH-001 ~ AUTH-004: 인증 시스템 구현

### Sprint 2 (2주차): 시설 관리 & 키오스크 기본
- FAC-001 ~ FAC-005: 시설 관리 API
- KDEV-001 ~ KDEV-005: 키오스크 장비 관리
- KRENT-001 ~ KRENT-002: 기본 대여 프로세스

### Sprint 3 (3주차): 시설관리자 기능
- FDEV-001 ~ FDEV-005: 시설 장비 관리
- FRENT-001 ~ FRENT-005: 시설 대여/반납
- REP-001 ~ REP-003: 고장 신고 기본

### Sprint 4 (4주차): 통계 & Frontend 연동
- STAT-001 ~ STAT-004: 통계 API
- FE-FAC-001 ~ FE-FAC-008: Facility Frontend 연동

---

## ⚠️ 중요 참고사항

### 목업 데이터 처리
- 현재 Frontend는 **목업 데이터**로 작동 중
- Backend API 완성 후 실제 데이터로 교체 필요
- 목업 파일은 백업 후 삭제하지 말 것 (예: `lib/database.ts`)

### 장비 유형 ENUM 주의
- **키오스크**: 영어 (AR_GLASS, BONE_CONDUCTION, SMARTPHONE)
- **시설**: 한글 (AR글라스, 골전도 이어폰, 스마트폰)
- Entity 정의 시 주의 필요

### 보안 고려사항
- 전화번호 마스킹 필수
- 비밀번호 bcrypt 해싱
- JWT Secret 환경변수화
- SQL Injection 방어 (TypeORM ORM 사용)

### Git Commit Message 규칙
- feat: 새로운 기능 추가
- fix: 버그 수정
- refactor: 코드 리팩토링
- docs: 문서 수정
- test: 테스트 코드 추가/수정
- chore: 기타 작업

---

**마지막 업데이트**: 2025-10-15
**다음 리뷰**: Sprint 1 완료 후
