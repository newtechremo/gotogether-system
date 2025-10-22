# GoTogether 시스템 빠른 시작 가이드

## 🚀 서버 실행 방법

### 백엔드 서버 시작
```bash
cd /mnt/d/work/node/gotogether-system/backend
PORT=3002 npm run start:dev
```
- URL: http://localhost:3002
- Swagger: http://localhost:3002/api
- 로그: `/tmp/backend.log`

### 관리자 프론트엔드 시작
```bash
cd /mnt/d/work/node/gotogether-system/frontend/admin
PORT=5173 npm run dev
```
- URL: http://localhost:5173
- 로그: `/tmp/admin-frontend.log`

### 시설관리자 프론트엔드 시작
```bash
cd /mnt/d/work/node/gotogether-system/frontend/facility
PORT=5174 npm run dev
```
- URL: http://localhost:5174

## 📊 현재 작업 상황 확인

다음 파일들을 확인하세요:
```bash
# 현재 상황 및 완료된 작업
cat /mnt/d/work/node/gotogether-system/CURRENT_STATUS.md

# 해야할 일 목록
cat /mnt/d/work/node/gotogether-system/TODO.md

# 이 가이드
cat /mnt/d/work/node/gotogether-system/QUICK_START.md
```

## 🎯 지금 해야 할 일

### 우선순위 1: 시설관리자 프로필 수정 페이지
```bash
# 백엔드 작업 시작
cd /mnt/d/work/node/gotogether-system/backend/src/facility
# 다음 파일들 수정:
# - facility.controller.ts
# - facility.service.ts
# - dto/update-facility-profile.dto.ts (생성)
# - dto/change-facility-password.dto.ts (생성)

# 프론트엔드 작업 시작
cd /mnt/d/work/node/gotogether-system/frontend/facility
# 다음 파일들 생성/수정:
# - app/profile/page.tsx (생성)
# - lib/hooks/useFacilityProfile.ts (생성)
```

### 우선순위 2: 전체관리자의 시설 비밀번호 재설정
```bash
# 백엔드 작업
cd /mnt/d/work/node/gotogether-system/backend/src/admin
# - admin.controller.ts (수정)
# - dto/reset-facility-password.dto.ts (생성)

cd /mnt/d/work/node/gotogether-system/backend/src/facilities
# - facilities.service.ts (수정)

# 프론트엔드 작업
cd /mnt/d/work/node/gotogether-system/frontend/admin
# - components/tabs/FacilityManagementTab.tsx (수정)
# - components/modals/ResetFacilityPasswordModal.tsx (생성)
# - lib/hooks/useFacilities.ts (수정)
```

## 🔑 테스트 계정

### 전체관리자
```bash
# 로그인 테스트
curl -X POST http://localhost:3002/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 시설관리자 (예시)
```bash
# 로그인 테스트
curl -X POST http://localhost:3002/auth/facility/login \
  -H "Content-Type: application/json" \
  -d '{"username":"facility","password":"password"}'
```

## 📂 프로젝트 구조 빠른 참조

```
gotogether-system/
├── backend/                    # NestJS 백엔드 (Port: 3002)
│   ├── src/
│   │   ├── admin/             # 전체관리자 API
│   │   ├── auth/              # 인증 모듈
│   │   ├── facility/          # 시설관리자 API
│   │   ├── kiosk/             # 키오스크 API
│   │   └── common/            # 공통 모듈
│   └── package.json
│
├── frontend/
│   ├── admin/                 # 전체관리자 포털 (Port: 5173)
│   │   ├── app/
│   │   │   ├── dashboard/    # 대시보드
│   │   │   ├── kiosks/       # 키오스크 관리
│   │   │   └── login/        # 로그인
│   │   ├── components/
│   │   │   └── tabs/         # 대시보드 탭들
│   │   └── lib/
│   │       └── hooks/        # API Hooks
│   │
│   └── facility/             # 시설관리자 포털 (Port: 5174)
│       ├── app/
│       │   ├── devices/      # 장비 관리
│       │   ├── rentals/      # 대여 관리
│       │   ├── repairs/      # 수리 관리
│       │   ├── history/      # 히스토리
│       │   └── login/        # 로그인
│       ├── components/
│       └── lib/
│
├── docs/                     # 문서
│   ├── api.md               # API 명세
│   └── erd.md               # DB ERD
│
├── CURRENT_STATUS.md        # 📋 현재 상황 정리
├── TODO.md                  # ✅ 할 일 목록
├── QUICK_START.md           # 🚀 이 파일
└── CLAUDE.md               # Claude 작업 가이드
```

## 🛠️ 자주 사용하는 명령어

### 백엔드
```bash
# 개발 서버 시작
cd backend && PORT=3002 npm run start:dev

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 테스트
npm run test

# 린트
npm run lint
```

### 프론트엔드
```bash
# 개발 서버 시작 (관리자)
cd frontend/admin && PORT=5173 npm run dev

# 개발 서버 시작 (시설)
cd frontend/facility && PORT=5174 npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start
```

### 디버깅
```bash
# 백엔드 로그 확인
tail -f /tmp/backend.log

# 프론트엔드 로그 확인
tail -f /tmp/admin-frontend.log

# 실행 중인 프로세스 확인
lsof -i :3002  # 백엔드
lsof -i :5173  # 관리자 프론트
lsof -i :5174  # 시설 프론트

# 포트 강제 종료
fuser -k 3002/tcp  # 백엔드
fuser -k 5173/tcp  # 관리자 프론트
fuser -k 5174/tcp  # 시설 프론트
```

## 📝 개발 워크플로우

### 1. 새로운 기능 개발 시작
```bash
# 1. 현재 상황 확인
cat CURRENT_STATUS.md
cat TODO.md

# 2. 서버 실행 확인
lsof -i :3002  # 백엔드
lsof -i :5173  # 프론트

# 3. 백엔드 개발
cd backend/src/[module]
# DTO 생성 → Service 로직 → Controller 엔드포인트

# 4. Swagger로 테스트
open http://localhost:3002/api

# 5. 프론트엔드 개발
cd frontend/[admin|facility]
# Hook 생성 → 컴포넌트/페이지 → 통합
```

### 2. 작업 완료 후
```bash
# 1. 문서 업데이트
vim CURRENT_STATUS.md  # 완료된 작업 추가
vim TODO.md            # 완료 항목 체크

# 2. Git 커밋
git add .
git commit -m "feat: [기능 설명]"

# 3. 테스트
npm run test  # 백엔드
npm run build # 프론트엔드
```

## 🔍 문제 해결

### 서버가 시작되지 않을 때
```bash
# 포트 확인 및 프로세스 종료
fuser -k 3002/tcp 2>/dev/null && sleep 3

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제 (프론트엔드)
rm -rf .next
```

### API 호출이 안될 때
```bash
# 백엔드 로그 확인
tail -50 /tmp/backend.log | grep -i error

# JWT 토큰 확인
curl -X POST http://localhost:3002/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq
```

### TypeScript 에러
```bash
# tsconfig 확인
npx tsc --noEmit

# 타입 캐시 삭제
rm -rf node_modules/.cache
```

## 💡 유용한 팁

1. **여러 터미널 사용**: 백엔드/프론트엔드/로그 모니터링을 각각 별도 터미널에서 실행
2. **Swagger 활용**: API 테스트는 Swagger UI로 빠르게 (http://localhost:3002/api)
3. **Hot Reload**: 코드 수정 시 자동으로 재시작됨 (watch 모드)
4. **Git 자주 커밋**: 작은 단위로 자주 커밋하여 롤백 쉽게
5. **문서 업데이트**: CURRENT_STATUS.md는 항상 최신 상태로 유지

## 📞 도움이 필요할 때

1. `CLAUDE.md` - Claude 작업 가이드 확인
2. `docs/api.md` - API 명세 확인
3. `docs/erd.md` - DB 스키마 확인
4. `TODO.md` - 다음 작업 확인

## 🎉 작업 준비 완료!

모든 문서가 준비되었습니다. 이제 바로 작업을 시작할 수 있습니다!

```bash
# 현재 우선순위 작업 시작
cat TODO.md | head -100  # TODO 목록 확인
cd backend/src/facility  # 시설관리자 프로필 기능 개발 시작
```
