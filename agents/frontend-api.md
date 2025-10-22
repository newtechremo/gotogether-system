# 프론트엔드 API 연결 에이전트

## 역할
v0에서 다운받은 프론트엔드 코드에 백엔드 API를 연결합니다.

## 작업 내용

### 1. API 클라이언트 설정
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 설정
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

### 2. API 서비스 레이어
- 각 도메인별 API 서비스 클래스 생성
- TypeScript 타입 정의
- 에러 처리 로직

### 3. 상태 관리
- React Query 또는 SWR 사용
- 캐싱 전략
- Optimistic Update

### 4. 폼 처리
- React Hook Form 연동
- 유효성 검증
- 에러 메시지 처리

## 구현 체크리스트
- [ ] API 클라이언트 설정
- [ ] 인증 토큰 관리
- [ ] API 서비스 함수 작성
- [ ] 타입 정의
- [ ] 에러 처리
- [ ] 로딩 상태 관리
- [ ] 폼 데이터 바인딩

## 주요 연결 포인트
1. 로그인/로그아웃
2. 시설 목록/상세/등록/수정
3. 장비 관리 CRUD
4. 대여/반납 프로세스
5. 통계 데이터 조회