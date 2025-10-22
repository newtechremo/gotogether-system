# Admin 프론트엔드 API 연결 가이드

**작업 일시**: 2025-10-15
**대상 시스템**: GoTogether Admin Frontend

---

## 📋 개요

v0에서 생성된 Admin 프론트엔드에 NestJS 백엔드 API를 연결하는 작업이 완료되었습니다.

### 구현된 기능
- ✅ Axios 기반 API 클라이언트 설정
- ✅ React Query를 통한 서버 상태 관리
- ✅ 인증 (로그인/로그아웃) API 연결
- ✅ 시설 관리 CRUD API 연결
- ✅ 에러 처리 및 토스트 알림
- ✅ 로그인 페이지 구현

---

## 🗂️ 파일 구조

```
frontend/admin/
├── .env.local                          # 환경 변수 (로컬)
├── .env.example                        # 환경 변수 예제
├── lib/
│   ├── api/
│   │   ├── client.ts                   # Axios 클라이언트 설정
│   │   ├── auth.service.ts             # 인증 API 서비스
│   │   └── facility.service.ts         # 시설 관리 API 서비스
│   ├── hooks/
│   │   ├── useAuth.ts                  # 인증 관련 React Query 훅
│   │   └── useFacility.ts              # 시설 관리 React Query 훅
│   └── providers/
│       └── query-provider.tsx          # React Query Provider
└── app/
    ├── layout.tsx                      # 루트 레이아웃 (QueryProvider 추가됨)
    └── login/
        └── page.tsx                    # 로그인 페이지
```

---

## 🔧 설치된 패키지

```bash
npm install axios @tanstack/react-query --legacy-peer-deps
```

### 주요 의존성
- `axios`: ^1.12.2 - HTTP 클라이언트
- `@tanstack/react-query`: ^5.90.3 - 서버 상태 관리
- `sonner`: ^1.7.4 - 토스트 알림 (이미 설치됨)
- `react-hook-form`: ^7.60.0 - 폼 관리 (이미 설치됨)
- `zod`: 3.25.76 - 스키마 검증 (이미 설치됨)

---

## 🌐 API 클라이언트 설정

### client.ts

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 주요 기능

#### 요청 인터셉터
- localStorage에서 `admin_token` 읽어 Authorization 헤더 추가
- SSR 안전성을 위해 `typeof window` 체크

#### 응답 인터셉터
- 401 에러 시 자동 로그아웃 및 로그인 페이지 리다이렉트
- 토큰 및 사용자 정보 자동 삭제

---

## 🔐 인증 API (auth.service.ts)

### 제공 API

#### 1. 로그인
```typescript
authService.login(data: LoginRequest): Promise<LoginResponse>
```

**요청**:
```typescript
{
  username: string;
  password: string;
}
```

**응답**:
```typescript
{
  success: true,
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: number;
      username: string;
      name: string;
      role: string;
      permissions: string[];
    };
    expires_in: number;
  }
}
```

#### 2. 로그아웃
```typescript
authService.logout(): Promise<void>
```

#### 3. 현재 사용자 정보
```typescript
authService.getCurrentUser(): Promise<CurrentUserResponse>
```

#### 4. 유틸리티 함수
- `saveToken(token: string)`: 토큰 저장
- `saveUser(user: UserData)`: 사용자 정보 저장
- `getSavedUser()`: 저장된 사용자 정보 가져오기
- `isAuthenticated()`: 로그인 상태 확인

---

## 🏢 시설 관리 API (facility.service.ts)

### 제공 API

#### 1. 시설 목록 조회
```typescript
facilityService.getFacilities(params?: GetFacilitiesParams): Promise<GetFacilitiesResponse>
```

**파라미터**:
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
```

#### 2. 시설 상세 조회
```typescript
facilityService.getFacility(id: number): Promise<GetFacilityResponse>
```

#### 3. 시설 등록
```typescript
facilityService.createFacility(data: CreateFacilityRequest): Promise<CreateFacilityResponse>
```

**요청 데이터**:
```typescript
{
  facilityCode: string;
  facilityName: string;
  username: string;
  password: string;
  managerName?: string;
  managerPhone?: string;
  address?: string;
}
```

#### 4. 시설 수정
```typescript
facilityService.updateFacility(id: number, data: UpdateFacilityRequest): Promise<UpdateFacilityResponse>
```

#### 5. 시설 삭제
```typescript
facilityService.deleteFacility(id: number): Promise<DeleteFacilityResponse>
```

---

## 🪝 React Query 훅

### 인증 훅 (useAuth.ts)

#### useLogin
```typescript
const { mutate: login, isPending } = useLogin();

login({ username: "admin", password: "password123" });
```

**기능**:
- 로그인 API 호출
- 성공 시 토큰/사용자 정보 저장
- 성공 토스트 메시지
- 대시보드로 자동 리다이렉트

#### useLogout
```typescript
const { mutate: logout } = useLogout();

logout();
```

#### useCurrentUser
```typescript
const { data: user, isLoading, error } = useCurrentUser();
```

**특징**:
- 자동 캐싱 (staleTime: 5분)
- 인증된 경우에만 실행
- 재시도 안 함

#### useAuthStatus
```typescript
const { user, isLoading, isAuthenticated, error } = useAuthStatus();
```

### 시설 관리 훅 (useFacility.ts)

#### useFacilities (목록 조회)
```typescript
const { data, isLoading, error } = useFacilities({ page: 1, limit: 10 });
```

#### useFacility (상세 조회)
```typescript
const { data, isLoading } = useFacility(facilityId);
```

#### useCreateFacility (등록)
```typescript
const { mutate: createFacility, isPending } = useCreateFacility();

createFacility({
  facilityCode: "FAC001",
  facilityName: "서울센터",
  username: "seoul_admin",
  password: "password123",
});
```

**자동 기능**:
- 성공 시 목록 캐시 자동 갱신
- 성공/실패 토스트 메시지

#### useUpdateFacility (수정)
```typescript
const { mutate: updateFacility } = useUpdateFacility();

updateFacility({
  id: 1,
  data: { facilityName: "서울센터 본점" }
});
```

#### useDeleteFacility (삭제)
```typescript
const { mutate: deleteFacility } = useDeleteFacility();

deleteFacility(facilityId);
```

---

## 📄 로그인 페이지 (`app/login/page.tsx`)

### 주요 기능

1. **폼 검증**: React Hook Form + Zod
2. **UI 컴포넌트**: shadcn/ui
3. **비밀번호 표시/숨김** 토글
4. **로딩 상태** 표시
5. **에러 메시지** 표시

### 사용 예시

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

const { mutate: login, isPending } = useLogin();

const onSubmit = (data: LoginFormData) => {
  login(data);
};
```

---

## 🔥 에러 처리

### API 에러 응답 형식

```typescript
{
  success: false,
  error: {
    code: string;        // 예: "AUTH_001"
    message: string;     // 예: "Invalid credentials"
  }
}
```

### 자동 에러 처리

1. **401 Unauthorized**
   - 자동 로그아웃
   - 로그인 페이지로 리다이렉트
   - localStorage 클리어

2. **토스트 메시지**
   - 모든 mutation에 성공/실패 토스트 자동 표시
   - `sonner` 라이브러리 사용

3. **React Query 재시도**
   - Query: 1회 재시도
   - Mutation: 재시도 안 함

---

## ⚙️ 환경 변수

### .env.local

```bash
# API 서버 URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# 환경 설정
NODE_ENV=development
```

### 프로덕션 환경

```bash
NEXT_PUBLIC_API_URL=https://api.gotogether.kr
NODE_ENV=production
```

---

## 🚀 사용 방법

### 1. 개발 서버 실행

#### 백엔드 (NestJS)
```bash
cd backend
npm run start:dev
```

#### 프론트엔드 (Next.js)
```bash
cd frontend/admin
npm run dev
```

### 2. 로그인 테스트

1. 브라우저에서 `http://localhost:3001/login` 접속
2. 테스트 계정으로 로그인:
   - Username: `testadmin`
   - Password: `Test1234!`
3. 성공 시 `/dashboard`로 자동 이동

### 3. API 호출 예시

#### 컴포넌트에서 사용

```typescript
"use client";

import { useFacilities } from "@/lib/hooks/useFacility";

export default function FacilityListPage() {
  const { data, isLoading, error } = useFacilities({
    page: 1,
    limit: 10
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return (
    <div>
      {data?.data.facilities.map(facility => (
        <div key={facility.id}>{facility.facilityName}</div>
      ))}
    </div>
  );
}
```

---

## 🛡️ 보안 고려사항

### 1. 토큰 저장
- Access Token: localStorage에 저장
- Refresh Token: localStorage에 저장
- ⚠️ 프로덕션에서는 HttpOnly Cookie 사용 권장

### 2. CSRF 방어
- 현재: CORS 설정으로 제한
- 향후: CSRF 토큰 추가 권장

### 3. XSS 방어
- React의 기본 escaping 활용
- 사용자 입력 검증 (Zod)

### 4. API 타임아웃
- 기본: 10초
- 긴 작업은 개별 설정 필요

---

## 📊 상태 관리 전략

### React Query 설정

```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1분
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
}
```

### 캐시 전략

1. **인증 정보**: 5분 캐시
2. **시설 목록**: 30초 캐시
3. **시설 상세**: 자동 캐시
4. **Mutation 성공 시**: 자동 캐시 무효화

---

## 🐛 트러블슈팅

### 1. CORS 에러

**증상**: API 호출 시 CORS 에러 발생

**해결**:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
});
```

### 2. 401 Unauthorized 루프

**증상**: 로그인 후 계속 401 에러

**원인**: 토큰이 제대로 저장/전송되지 않음

**확인**:
```typescript
// 브라우저 콘솔
localStorage.getItem('admin_token')

// Network 탭에서 Authorization 헤더 확인
```

### 3. React 19 의존성 충돌

**증상**: npm install 시 peer dependency 에러

**해결**:
```bash
npm install --legacy-peer-deps
```

---

## 📝 TODO (향후 개선사항)

### 우선순위 높음
- [ ] Refresh Token 자동 갱신 로직
- [ ] 보호된 라우트 (Protected Route) 컴포넌트
- [ ] 에러 바운더리 추가
- [ ] API 응답 로깅

### 우선순위 중간
- [ ] React Query DevTools 추가
- [ ] Optimistic Updates 적용
- [ ] 무한 스크롤 구현
- [ ] 시설 검색 디바운스

### 우선순위 낮음
- [ ] MSW를 통한 API Mocking
- [ ] Storybook 연동
- [ ] E2E 테스트 (Playwright)

---

## 📚 참고 문서

- [Axios 공식 문서](https://axios-http.com/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Next.js App Router](https://nextjs.org/docs/app)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)

---

**작성자**: Backend Development Team
**최종 수정**: 2025-10-15
