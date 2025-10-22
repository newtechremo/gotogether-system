# GoTogether 시스템 할 일 목록

## 🎯 HIGH PRIORITY (즉시 작업 필요)

### ✅ 1. 시설관리자 프로필 수정 페이지 개발 (완료)

#### 백엔드 작업
- [x] `GET /facility/profile` API 개발
  - 현재 로그인한 시설관리자 정보 조회
  - JWT에서 facilityId 추출
  - 비밀번호는 응답에서 제외
  - 파일: `backend/src/facility/facility-profile.controller.ts`, `facility.service.ts`

- [x] `PUT /facility/profile` API 개발
  - 시설관리자 본인 프로필 수정
  - 수정 가능 항목:
    - `manager_name` (담당자명)
    - `manager_phone` (담당자 전화번호)
    - `address` (주소)
  - JWT에서 facilityId 추출하여 본인 정보만 수정 가능
  - 파일: `backend/src/facility/facility-profile.controller.ts`, `facility.service.ts`

- [x] `PUT /facility/profile/password` API 개발
  - 비밀번호 변경 전용 API
  - 입력값:
    - `currentPassword` (현재 비밀번호)
    - `newPassword` (새 비밀번호)
    - `confirmPassword` (새 비밀번호 확인)
  - 현재 비밀번호 검증 필수
  - bcrypt 해싱 적용
  - 파일: `backend/src/facility/facility-profile.controller.ts`, `facility.service.ts`

- [x] DTO 생성
  - `FacilityProfileResponseDto` - 프로필 조회 응답
  - `UpdateFacilityProfileDto` - 프로필 수정용
  - `ChangeFacilityPasswordDto` - 비밀번호 변경용
  - 파일: `backend/src/common/dto/facility-profile.dto.ts`

#### 프론트엔드 작업
- [ ] 시설관리자 포털 경로 확인
  - `frontend/facility/` 폴더 존재 여부 확인
  - 없다면 생성 필요

- [ ] 프로필 수정 페이지 생성
  - 경로: `/facility/profile` 또는 `/facility/settings`
  - 파일: `frontend/facility/app/profile/page.tsx` (예상)

- [ ] 프로필 정보 표시
  - 시설명 (수정 불가)
  - 시설 코드 (수정 불가)
  - 담당자명 (수정 가능)
  - 담당자 전화번호 (수정 가능)
  - 주소 (수정 가능)

- [ ] 비밀번호 변경 폼
  - 현재 비밀번호 입력
  - 새 비밀번호 입력
  - 새 비밀번호 확인
  - 유효성 검사 (최소 8자, 영문+숫자 조합 등)

- [ ] API Hook 생성
  - `useUpdateFacilityProfile()` - 프로필 수정
  - `useChangeFacilityPassword()` - 비밀번호 변경
  - 파일: `frontend/facility/lib/hooks/useFacilityProfile.ts` (예상)

#### 테스트
- [ ] 프로필 조회 기능 테스트
- [ ] 프로필 수정 기능 테스트
- [ ] 비밀번호 변경 기능 테스트
- [ ] 권한 체크 (본인만 수정 가능)

---

### ✅ 2. 전체관리자의 시설관리에서 비밀번호 재설정 기능 (완료)

#### 백엔드 작업
- [x] `POST /admin/facilities/:id/reset-password` API 개발
  - 시설 비밀번호 재설정 (전체관리자만 가능)
  - 입력값:
    - `newPassword` (새 비밀번호 - 선택적)
    - `autoGenerate` (자동 생성 여부 - 선택적)
  - `autoGenerate: true`이면 랜덤 비밀번호 생성
  - 응답: 새 비밀번호 반환 (평문, 1회만 표시)
  - 파일: `backend/src/admin/admin.controller.ts`, `backend/src/admin/admin.service.ts`

- [x] 비밀번호 자동 생성 유틸리티
  - 안전한 랜덤 비밀번호 생성 함수
  - 요구사항: 최소 12자, 영문 대소문자 + 숫자 + 특수문자
  - 파일: `backend/src/common/utils/password-generator.ts`

- [x] DTO 생성
  - `ResetFacilityPasswordDto` - 비밀번호 재설정 요청
  - `ResetFacilityPasswordResponseDto` - 비밀번호 재설정 응답
  - 파일: `backend/src/common/dto/reset-facility-password.dto.ts`

#### 프론트엔드 작업
- [ ] 시설 관리 탭에 "비밀번호 재설정" 버튼 추가
  - 파일: `frontend/admin/components/tabs/FacilityManagementTab.tsx`
  - 각 시설 행의 액션 버튼 영역에 추가

- [ ] 비밀번호 재설정 모달 컴포넌트
  - 파일: `frontend/admin/components/modals/ResetFacilityPasswordModal.tsx`
  - 옵션 1: 직접 입력
  - 옵션 2: 자동 생성
  - 확인 다이얼로그 (실수 방지)

- [ ] 새 비밀번호 표시 모달
  - 재설정 성공 후 새 비밀번호 표시
  - 복사 버튼 제공
  - 경고 메시지: "이 비밀번호는 다시 표시되지 않습니다"

- [ ] API Hook 생성
  - `useResetFacilityPassword()`
  - 파일: `frontend/admin/lib/hooks/useFacilities.ts`

#### 테스트
- [ ] 비밀번호 재설정 기능 테스트 (직접 입력)
- [ ] 비밀번호 재설정 기능 테스트 (자동 생성)
- [ ] 새 비밀번호로 로그인 가능 여부 확인
- [ ] 권한 체크 (전체관리자만 가능)

---

## 📊 MEDIUM PRIORITY (다음 단계)

### 3. 실시간 대여 현황 개선
- [ ] 실시간 자동 새로고침 기능
  - WebSocket 또는 polling 방식 선택
  - 30초마다 자동 갱신 옵션

- [ ] 대여율 시각화
  - Chart.js 또는 Recharts 사용
  - 키오스크별 대여율 바 차트
  - 장비 타입별 대여율 파이 차트

- [ ] 날짜 범위 선택 기능
  - 시작일~종료일 범위 선택
  - 기간별 통계 표시

### 4. 키오스크 상세 페이지 개선
- [ ] 대여 히스토리 차트
  - 일별/주별/월별 대여 건수 그래프

- [ ] 장비별 사용률 통계
  - 가장 많이 대여된 장비 순위
  - 평균 대여 시간

### 5. 알림 기능
- [ ] 연체 알림
  - 연체 발생 시 관리자에게 알림

- [ ] 장비 고장 알림
  - 고장 상태 장비 등록 시 알림

---

## 🔧 TECHNICAL DEBT (기술 부채)

### 코드 품질
- [ ] TypeScript strict 모드 활성화
- [ ] ESLint 규칙 강화
- [ ] 단위 테스트 커버리지 증가 (목표: 80%)

### 성능 최적화
- [ ] 대여 목록 페이지네이션 개선
- [ ] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [ ] API 응답 캐싱 전략 수립

### 보안
- [ ] Rate limiting 적용
- [ ] CORS 설정 강화
- [ ] XSS 방지 검증

---

## 📝 작업 진행 방법

### 1단계: 백엔드 API 개발
1. DTO 생성
2. Service 로직 구현
3. Controller 엔드포인트 추가
4. Swagger 문서 작성
5. Postman/curl 테스트

### 2단계: 프론트엔드 개발
1. API Hook 생성
2. 페이지/컴포넌트 구현
3. 폼 유효성 검사
4. 에러 핸들링
5. 브라우저 테스트

### 3단계: 통합 테스트
1. E2E 시나리오 테스트
2. 권한 체크
3. 에러 케이스 확인
4. 사용자 경험 개선

---

## 🚀 다음 작업 시작하기

### 우선순위 1번 작업 시작 시:
```bash
# 백엔드 개발 서버 실행 확인
cd /mnt/d/work/node/gotogether-system/backend
PORT=3002 npm run start:dev

# 프론트엔드 개발 서버 실행 확인
cd /mnt/d/work/node/gotogether-system/frontend/admin
PORT=5173 npm run dev
```

### 파일 위치 빠른 참조:
- 백엔드 시설 모듈: `backend/src/facility/`
- 백엔드 관리자 모듈: `backend/src/admin/`
- 프론트엔드 관리자: `frontend/admin/`
- 프론트엔드 시설: `frontend/facility/` (확인 필요)

---

## ✅ 체크리스트

작업 완료 시 다음을 확인:
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
- [ ] Swagger 문서 업데이트
- [ ] CURRENT_STATUS.md 업데이트
- [ ] Git 커밋 및 푸시
