# Backend Implementation Notes

## Admin Dashboard API - 2025-10-17

### 구현 완료 항목

**API 엔드포인트**: `GET /admin/dashboard/stats`

**파일 목록**:
- `/backend/src/admin/admin.controller.ts` - 컨트롤러
- `/backend/src/admin/admin.service.ts` - 서비스 (비즈니스 로직)
- `/backend/src/admin/admin.module.ts` - 모듈 정의
- `/backend/src/common/dto/dashboard.dto.ts` - DTO 정의

**app.module.ts 업데이트**: AdminModule import 추가 완료

### 현재 상태 (목업 데이터 사용 중)

다음 필드들은 **목업 데이터**를 반환하고 있습니다:

1. **totalKiosks** (현재 값: 15)
   - 실제 구현 필요: `kiosk_devices` 테이블에서 COUNT 조회
   - 변경 위치: `admin.service.ts:24`

2. **todayRentals** (현재 값: 45)
   - 실제 구현 필요:
     ```sql
     SELECT COUNT(*) FROM kiosk_rentals WHERE DATE(rental_start_datetime) = CURDATE()
     + SELECT COUNT(*) FROM facility_rentals WHERE rental_date = CURDATE()
     ```
   - 변경 위치: `admin.service.ts:29`

3. **overdueRentals** (현재 값: 3)
   - 실제 구현 필요:
     ```sql
     SELECT COUNT(*) FROM kiosk_rentals WHERE status = 'overdue'
     + SELECT COUNT(*) FROM facility_rentals WHERE status = '연체'
     ```
   - 변경 위치: `admin.service.ts:34`

**실제 DB 조회 구현 완료**:
- **totalFacilities**: `facilities` 테이블에서 `isActive=true` 조건으로 COUNT 조회

### TODO: 실제 데이터로 변경해야 할 작업

1. **Kiosk 엔티티 생성**
   - `src/entities/kiosk-device.entity.ts`
   - `src/entities/kiosk-rental.entity.ts`

2. **admin.service.ts 업데이트**
   - Repository 추가: `KioskDevice`, `KioskRental`, `FacilityRental`
   - 실제 DB 쿼리로 목업 데이터 대체

3. **연체 상태 확인 로직 구현**
   - Kiosk: `expected_return_datetime` vs 현재 시간
   - Facility: `return_date` vs 현재 날짜

### 보안 및 인증

- **JWT 인증**: `JwtAuthGuard` 적용됨
- **권한 체크**: `RolesGuard`로 `super_admin`, `admin` 역할만 접근 가능
- **Swagger 문서화**: 완료

### 테스트 방법

```bash
# 빌드 확인
npm run build

# 개발 서버 실행
npm run start:dev

# API 테스트 (JWT 토큰 필요)
curl -H "Authorization: Bearer <token>" \
  https://dev-api.gotogether.kr/v1/admin/dashboard/stats
```

### 응답 예시

```json
{
  "success": true,
  "data": {
    "totalKiosks": 15,
    "totalFacilities": 0,
    "todayRentals": 45,
    "overdueRentals": 3
  }
}
```

---

**작성자**: Claude Code
**작성일**: 2025-10-17
**상태**: 목업 데이터 사용 중 (추후 실제 DB 조회로 변경 필요)
