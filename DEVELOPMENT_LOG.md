# 개발 로그 및 주요 이슈

> 작성일: 2025-10-16
> 목적: 개발 재시작 시 빠른 상황 파악 및 반복 에러 방지

## 현재 실행 상태

### 백엔드 (Backend)
- **포트**: 3002
- **상태**: 실행 중 ✅
- **실행 명령어**: `cd backend && PORT=3002 npm run start:dev`
- **API 문서**: http://localhost:3002/api
- **데이터베이스**: MySQL (gotogether)
  - Host: localhost:3306
  - Username: gt_db
  - Password: gtpw1@3$

### 프론트엔드 - 관리자 (Admin)
- **포트**: 5173
- **상태**: 실행 중 ✅
- **실행 명령어**: `cd frontend/admin && PORT=5173 npm run dev`
- **접속 URL**: http://localhost:5173
- **백엔드 연결**: http://localhost:3002

### 프론트엔드 - 시설관리자 (Facility)
- **포트**: 5174
- **상태**: 실행 중 ✅
- **실행 명령어**: `cd frontend/facility && PORT=5174 npm run dev`
- **접속 URL**: http://localhost:5174
- **백엔드 연결**: http://localhost:3002

### CORS 설정
```env
# backend/.env
CORS_ORIGIN=http://localhost:3001,http://localhost:5173,http://localhost:5174
```

---

## 🚨 자주 발생한 에러 및 해결 방법

### 1. Next.js Hydration Error
**증상**: "Text content does not match server-rendered HTML" 에러

**원인**:
- `<head>` 태그 내에서 동적 스타일을 생성할 때 서버와 클라이언트 간 불일치
- 폰트 변수가 서버/클라이언트에서 다르게 렌더링됨

**해결 방법**:
```tsx
// ❌ 잘못된 방법
<html lang="ko">
  <head>
    <style>{`
      html {
        font-family: ${GeistSans.style.fontFamily};
      }
    `}</style>
  </head>
</html>

// ✅ 올바른 방법
<html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
  <body style={{ fontSize: '150%' }}>
    {children}
  </body>
</html>
```

**파일 위치**: `frontend/facility/app/layout.tsx`

**추가 조치**: `globals.css`에 폰트 설정 추가
```css
@layer base {
  html {
    font-family: var(--font-sans), system-ui, sans-serif;
  }
  body {
    font-family: var(--font-sans), system-ui, sans-serif;
  }
}
```

---

### 2. React Ref Warning (Input 컴포넌트)
**증상**: "Function components cannot be given refs"

**원인**: Input 컴포넌트가 `React.forwardRef`로 감싸져 있지 않음

**해결 방법**:
```tsx
// ❌ 잘못된 방법
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input {...props} />
}

// ✅ 올바른 방법
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return <input ref={ref} {...props} />
  }
)
Input.displayName = 'Input'
```

**파일 위치**: `frontend/facility/components/ui/input.tsx`

---

### 3. CORS 에러
**증상**: 프론트엔드에서 API 호출 시 CORS policy 에러

**원인**: 백엔드 CORS 설정에 프론트엔드 포트가 누락됨

**해결 방법**:
1. `backend/.env` 파일에 포트 추가:
   ```env
   CORS_ORIGIN=http://localhost:3001,http://localhost:5173,http://localhost:5174
   ```

2. `backend/src/main.ts` 확인 (이미 구현됨):
   ```typescript
   const corsOrigins = process.env.CORS_ORIGIN
     ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
     : '*';

   app.enableCors({
     origin: corsOrigins,
     credentials: true,
   });
   ```

3. **중요**: `.env` 파일 수정 후 **반드시 백엔드 재시작 필요** (watch mode는 .env 변경 감지 안 함)

---

### 4. 로그인 페이지 리다이렉트 무한 루프
**증상**: 로그인 페이지 접속 시 계속 dashboard로 리다이렉트

**원인**: 이전 세션의 쿠키/localStorage가 남아있음

**해결 방법**:
```tsx
// frontend/admin/app/login/page.tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}, []);
```

**추가 조치**: middleware에서 root path(/) 처리 추가

---

## 📋 꼭 지켜야 할 개발 룰

### 1. 환경 변수 변경 시
```bash
# .env 파일 수정 후 반드시 서버 재시작 (watch mode는 .env 감지 안 함)
cd backend
# Ctrl+C로 종료 후
PORT=3002 npm run start:dev
```

### 2. 프론트엔드 포트 규칙
- **관리자 시스템**: 5173
- **시설관리자 시스템**: 5174
- **백엔드 API**: 3002

새로운 포트 추가 시:
1. `backend/.env` CORS_ORIGIN에 추가
2. 백엔드 재시작
3. 프론트엔드 `.env.local`에 백엔드 URL 설정

### 3. UI 컴포넌트 작성 시
- **모든 input/textarea/select 등 form 요소는 `React.forwardRef` 사용**
- displayName 설정 필수
```typescript
const ComponentName = React.forwardRef<HTMLElementType, PropsType>(
  (props, ref) => { ... }
)
ComponentName.displayName = 'ComponentName'
```

### 4. Next.js Layout 작성 시
- `<head>` 태그에서 동적 스타일 생성 금지
- 폰트 설정은 `className`으로 처리
- `suppressHydrationWarning` 속성 사용
- 글로벌 스타일은 `globals.css`에 작성

### 5. 브라우저 새로고침으로 해결 안 되는 경우
```bash
# 프론트엔드 재시작
# Ctrl+C로 종료 후
cd frontend/admin  # 또는 frontend/facility
PORT=5173 npm run dev  # 또는 PORT=5174
```

### 6. API 연결 확인
```bash
# 백엔드 상태 확인
curl http://localhost:3002

# 관리자 로그인 테스트
curl -X POST http://localhost:3002/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🚀 빠른 시작 가이드

### 처음 시작할 때 (Clean Start)
```bash
# 1. 백엔드 시작
cd /mnt/d/work/node/gotogether-system/backend
PORT=3002 npm run start:dev

# 2. 관리자 프론트엔드 시작 (새 터미널)
cd /mnt/d/work/node/gotogether-system/frontend/admin
PORT=5173 npm run dev

# 3. 시설관리자 프론트엔드 시작 (새 터미널)
cd /mnt/d/work/node/gotogether-system/frontend/facility
PORT=5174 npm run dev
```

### 접속 URL
- 관리자: http://localhost:5173
- 시설관리자: http://localhost:5174
- API 문서: http://localhost:3002/api

### 테스트 계정
- **관리자**: admin / admin123
- **시설관리자**: facility / facility123 (ID 2번 시설)

---

## 🔧 문제 발생 시 체크리스트

### 백엔드 연결 안 될 때
- [ ] 백엔드 프로세스가 실행 중인가?
- [ ] 포트 3002가 사용 중인가? (`lsof -i :3002`)
- [ ] MySQL이 실행 중인가?
- [ ] `.env` 파일이 올바른가?

### 프론트엔드 오류 발생 시
- [ ] `node_modules` 재설치: `rm -rf node_modules && npm install`
- [ ] `.next` 캐시 삭제: `rm -rf .next`
- [ ] 브라우저 캐시 완전 삭제 (Ctrl+Shift+Delete)
- [ ] 프로세스 재시작

### CORS 에러 발생 시
- [ ] `backend/.env`의 CORS_ORIGIN 확인
- [ ] 백엔드 재시작했는가?
- [ ] 브라우저 개발자 도구에서 실제 요청 URL 확인
- [ ] 프론트엔드 `.env.local`의 API URL 확인

---

## 📝 최근 수정 파일 목록

### Backend
- `backend/.env` - CORS 설정 (포트 5174 추가)
- `backend/src/main.ts` - CORS 여러 origin 지원
- `backend/src/facility/facility-statistics.service.ts` - 대여중 카운트 → 수량 합산 수정 (2025-10-16)

### Frontend - Admin
- `frontend/admin/middleware.ts` - 인증 라우팅 로직
- `frontend/admin/app/page.tsx` - 루트 페이지 리다이렉트
- `frontend/admin/app/login/page.tsx` - 쿠키/localStorage 정리

### Frontend - Facility
- `frontend/facility/.env.local` - 백엔드 URL (3002)
- `frontend/facility/app/layout.tsx` - Hydration 에러 수정
- `frontend/facility/app/globals.css` - 폰트 설정 추가
- `frontend/facility/components/ui/input.tsx` - forwardRef 적용
- `frontend/facility/components/dashboard/current-rentals.tsx` - 다이얼로그 제거, 네비게이션 방식 전환, 로딩 표시 (2025-10-16)
- `frontend/facility/components/dashboard/inventory-status.tsx` - 다이얼로그 제거, 네비게이션 방식 전환, 로딩 표시 (2025-10-16)
- `frontend/facility/components/rentals/rental-tabs.tsx` - URL 파라미터 처리, 자동 탭 전환 (2025-10-16)
- `frontend/facility/components/rentals/return-form.tsx` - 자동 rental 선택 기능 추가 (2025-10-16)
- `frontend/facility/components/navigation.tsx` - 타이틀 한 줄 표시, 탭 클릭 시 전체 화면 로딩 오버레이 (2025-10-16)

---

## 🎯 다음 작업 시 참고사항

1. **새로운 프론트엔드 추가 시**:
   - 포트 번호 결정 (5175, 5176...)
   - CORS 설정 업데이트
   - 백엔드 재시작
   - `.env.local` 생성

2. **새로운 API 엔드포인트 추가 시**:
   - Controller 생성
   - DTO 정의 (class-validator)
   - Swagger 데코레이터 추가
   - 에러 핸들링 적용

3. **UI 컴포넌트 라이브러리 확장 시**:
   - 모든 form 요소: `React.forwardRef` 필수
   - `displayName` 설정
   - TypeScript 타입 정의
   - Storybook 문서화 (선택사항)

---

## 💡 유용한 명령어

```bash
# 실행 중인 프로세스 확인
lsof -i :3002
lsof -i :5173
lsof -i :5174

# 프로세스 강제 종료
kill -9 <PID>

# 백엔드 로그 확인 (production)
pm2 logs backend

# Git 상태 확인
git status
git log --oneline -10

# 데이터베이스 접속
mysql -u gt_db -p gotogether
```

---

## 📅 작업 이력 (2025-10-16)

### 🔧 수정 내용

#### 1. 대시보드 통계 버그 수정
**파일**: `backend/src/facility/facility-statistics.service.ts`

**문제점**:
- 대시보드의 "현재 대여중" 숫자가 대여 건수(1)를 표시
- 실제로는 해당 대여의 장비 수량 합계(5)를 표시해야 함

**해결 방법**:
```typescript
// 변경 전: count로 대여 건수만 세기
const currentRentals = await this.facilityRentalRepository.count({
  where: { facilityId, status: '대여중' },
});

// 변경 후: find로 데이터를 가져와 수량 합산
const currentRentalsData = await this.facilityRentalRepository.find({
  where: { facilityId, status: '대여중' },
  relations: ['rentalDevices'],
});

const currentRentals = currentRentalsData.reduce((sum, rental) => {
  const rentalQuantity = rental.rentalDevices?.reduce(
    (deviceSum, device) => deviceSum + device.quantity, 0
  ) || 0;
  return sum + rentalQuantity;
}, 0);
```

#### 2. 대시보드 UI/UX 개선
**파일**:
- `frontend/facility/components/dashboard/current-rentals.tsx`
- `frontend/facility/components/dashboard/inventory-status.tsx`

**변경 사항**:
- ❌ **제거**: 다이얼로그(Dialog) 기반 대여/반납 UI
- ✅ **추가**: 대여/반납 페이지로 네비게이션 방식 전환
- ✅ **추가**: 버튼 클릭 시 "이동 중..." 로딩 표시
- ✅ **추가**: 로딩 중 다른 버튼 비활성화

**동작 방식**:
- "반납" 버튼 클릭 → `/rentals?tab=return&rentalId={id}` 로 이동
- "대여" 버튼 클릭 → `/rentals?tab=rent&deviceType={type}` 로 이동

#### 3. 대여/반납 페이지 자동 선택 기능
**파일**:
- `frontend/facility/components/rentals/rental-tabs.tsx`
- `frontend/facility/components/rentals/return-form.tsx`

**추가 기능**:
- URL 쿼리 파라미터(`tab`, `rentalId`) 자동 인식
- 반납 탭 자동 전환
- 해당 rental 자동 선택 및 하이라이트
- 사용자는 바로 메모 입력 후 "반납 완료" 클릭 가능

**구현 코드**:
```typescript
// rental-tabs.tsx
useEffect(() => {
  const tab = searchParams.get('tab')
  if (tab === 'return' || tab === 'rent') {
    setActiveTab(tab)
  }
}, [searchParams])

// return-form.tsx
useEffect(() => {
  if (preselectedRentalId) {
    const rentalId = parseInt(preselectedRentalId, 10)
    const rental = currentRentals.find(r => r.id === rentalId)
    if (rental) {
      setSelectedRental(rental)
    }
  }
}, [preselectedRentalId, currentRentals])
```

#### 4. 네비게이션 개선
**파일**: `frontend/facility/components/navigation.tsx`

**변경 사항**:
- ✅ **수정**: 타이틀 "같이봄 플러스 시설관리자 시스템" 한 줄로 표시 (`whitespace-nowrap`)
- ✅ **추가**: 상단 탭 클릭 시 전체 화면 로딩 오버레이
  - 검은색 반투명 배경 (bg-opacity-20, 80% 투명도로 원래 페이지 보임)
  - 회전하는 스피너 애니메이션
  - "페이지 이동 중..." 메시지
  - 모든 탭 비활성화 및 투명도 처리

**구현 코드**:
```typescript
const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  if (pathname !== href) {
    e.preventDefault()
    setIsNavigating(true)
    router.push(href)
  }
}

// JSX: 로딩 오버레이 (인라인 스타일로 80% 투명도 적용)
{isNavigating && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
  >
    <div className="bg-white rounded-lg p-8 border-4 border-black shadow-2xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-2xl font-bold text-black">페이지 이동 중...</p>
      </div>
    </div>
  </div>
)}
```

**참고**: Tailwind의 `bg-opacity-20` 대신 인라인 스타일 `rgba(0, 0, 0, 0.2)`를 사용하여 CSS 우선순위 문제를 해결했습니다.

### 📋 적용된 사용자 경험 개선

1. **명확한 피드백**: 모든 액션 버튼에 로딩 상태 표시
2. **실수 방지**: 로딩 중 다른 버튼 클릭 방지
3. **빠른 작업 흐름**: 대시보드 → 대여/반납 페이지 이동 시 자동 선택
4. **시각적 일관성**: 전체 화면 로딩 오버레이로 통일된 UX
5. **투명한 로딩**: 80% 투명도로 원래 페이지가 보여 작업 컨텍스트 유지

### 🔄 서버 재시작 규칙 (중요!)

**⚠️ 모든 코드 수정 후에는 반드시 프론트엔드 서버를 재시작하세요!**

```bash
# 프론트엔드 재시작 (필수)
cd frontend/admin && PORT=5173 npm run dev
cd frontend/facility && PORT=5174 npm run dev

# 백엔드 재시작 (.env 또는 주요 로직 변경 시)
cd backend && PORT=3002 npm run start:dev
```

**재시작이 필요한 경우**:
- ✅ 모든 컴포넌트 파일 수정 후
- ✅ 서비스 로직 변경 후
- ✅ 환경 변수(.env) 변경 후
- ✅ 새로운 패키지 설치 후

### 🎯 다음 세션을 위한 체크리스트

- [ ] 서버 실행 상태 확인 (포트 3002, 5173, 5174)
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
- [ ] DEVELOPMENT_LOG.md 최신 변경사항 확인
- [ ] 이전 작업에서 해결하지 못한 이슈 확인

---
