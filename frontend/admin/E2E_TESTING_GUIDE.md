# E2E 테스트 가이드

**작성 일시**: 2025-10-15
**대상**: GoTogether Admin Frontend
**테스트 프레임워크**: Puppeteer + Jest

---

## 📋 개요

Puppeteer를 사용한 End-to-End (E2E) 테스트 스위트입니다. 실제 브라우저 환경에서 사용자 시나리오를 자동화하여 애플리케이션의 전체 플로우를 검증합니다.

### 테스트 범위
- ✅ 인증 플로우 (로그인/로그아웃)
- ✅ 시설 관리 CRUD
- ✅ 접근성 (WCAG 2.1 AA)
- ✅ 키보드 내비게이션
- ✅ 반응형 디자인

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 백엔드 서버 실행

E2E 테스트는 실제 API를 호출하므로 백엔드 서버가 실행 중이어야 합니다.

```bash
# 다른 터미널에서
cd ../../backend
npm run start:dev
```

### 3. 테스트 실행

```bash
# 헤드리스 모드 (기본)
npm run test:e2e

# 브라우저 표시 모드
npm run test:e2e:headful

# 슬로우 모션 모드 (디버깅)
npm run test:e2e:slow

# 디버그 모드 (브라우저 표시 + 슬로우)
npm run test:e2e:debug

# Watch 모드
npm run test:e2e:watch
```

---

## 📁 파일 구조

```
frontend/admin/
├── e2e/
│   ├── auth.e2e.test.js          # 인증 플로우 테스트
│   ├── facility.e2e.test.js      # 시설 관리 테스트
│   ├── accessibility.e2e.test.js # 접근성 테스트
│   ├── setup.js                  # 전역 설정 및 헬퍼
│   ├── test-report.md            # 테스트 결과 리포트
│   └── screenshots/              # 스크린샷 저장 폴더
├── jest-puppeteer.config.js      # Puppeteer 설정
├── jest.e2e.config.js            # Jest E2E 설정
└── package.json
```

---

## 🧪 테스트 스크립트

### package.json 스크립트

```json
{
  "scripts": {
    "test:e2e": "jest --config=jest.e2e.config.js",
    "test:e2e:watch": "jest --config=jest.e2e.config.js --watch",
    "test:e2e:headful": "HEADLESS=false jest --config=jest.e2e.config.js",
    "test:e2e:slow": "SLOW_MO=100 jest --config=jest.e2e.config.js",
    "test:e2e:debug": "HEADLESS=false SLOW_MO=250 jest --config=jest.e2e.config.js"
  }
}
```

### 환경 변수

- `HEADLESS`: `false`로 설정하면 브라우저가 화면에 표시됨
- `SLOW_MO`: 밀리초 단위로 각 액션 사이에 지연 추가 (디버깅용)

---

## 🔧 설정 파일

### jest-puppeteer.config.js

```javascript
module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  },
  server: {
    command: 'npm run dev',
    port: 3001,
    launchTimeout: 30000,
  },
};
```

### jest.e2e.config.js

```javascript
module.exports = {
  preset: 'jest-puppeteer',
  testRegex: './*\\.e2e\\.test\\.js$',
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  globals: {
    BASE_URL: 'http://localhost:3001',
    API_URL: 'http://localhost:3000',
  },
};
```

---

## 📝 테스트 작성 가이드

### 기본 구조

```javascript
describe('기능명 E2E 테스트', () => {
  const BASE_URL = global.BASE_URL;

  beforeEach(async () => {
    // 테스트 전 초기화
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
  });

  test('테스트 케이스 설명', async () => {
    // Given: 초기 상태 설정
    await page.goto(`${BASE_URL}/path`, { waitUntil: 'networkidle0' });

    // When: 액션 실행
    await page.click('#button');
    await page.type('#input', 'value');

    // Then: 결과 검증
    expect(page.url()).toContain('/expected');
    await screenshot('test-case-name');
  });
});
```

### 전역 헬퍼 함수

`e2e/setup.js`에서 제공하는 헬퍼 함수:

```javascript
// 셀렉터 대기 (기본 10초)
await waitForSelector('#element');

// 클릭 후 네비게이션 대기
await clickAndWait('#button');

// 타이핑 with 지연
await typeAndWait('#input', 'text');

// 스크린샷 저장
await screenshot('screenshot-name');
```

---

## 🧪 테스트 예시

### 인증 테스트

```javascript
test('로그인 성공', async () => {
  await page.goto(`${BASE_URL}/login`);

  await page.type('#username', 'testadmin');
  await page.type('#password', 'Test1234!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation();
  expect(page.url()).toContain('/dashboard');

  const token = await page.evaluate(() =>
    localStorage.getItem('admin_token')
  );
  expect(token).not.toBeNull();
});
```

### 폼 제출 테스트

```javascript
test('시설 등록', async () => {
  await login(); // 헬퍼 함수

  await page.goto(`${BASE_URL}/facilities`);
  await page.click('[data-testid="add-button"]');

  await page.type('#facility_code', 'TEST001');
  await page.type('#facility_name', '테스트 시설');
  await page.click('[data-testid="save-button"]');

  await page.waitForTimeout(2000);
  const content = await page.content();
  expect(content).toContain('성공');
});
```

### 접근성 테스트

```javascript
const { AxePuppeteer } = require('@axe-core/puppeteer');

test('접근성 검사', async () => {
  await page.goto(`${BASE_URL}/login`);

  const results = await new AxePuppeteer(page).analyze();

  const criticalViolations = results.violations.filter(
    v => v.impact === 'critical'
  );

  expect(criticalViolations).toHaveLength(0);
});
```

---

## 🎯 Best Practices

### 1. 안정적인 셀렉터 사용

```javascript
// ✅ Good: data-testid 사용
await page.click('[data-testid="login-button"]');

// ❌ Bad: 불안정한 클래스명
await page.click('.btn-primary.login-btn');
```

### 2. 적절한 대기

```javascript
// ✅ Good: 특정 조건 대기
await page.waitForSelector('#element', { visible: true });
await page.waitForNavigation({ waitUntil: 'networkidle0' });

// ❌ Bad: 임의의 타임아웃
await page.waitForTimeout(5000);
```

### 3. 스크린샷 활용

```javascript
// 중요한 상태마다 스크린샷 저장
await screenshot('before-submit');
await page.click('#submit');
await screenshot('after-submit');
```

### 4. 에러 처리

```javascript
try {
  await page.waitForNavigation({ timeout: 10000 });
  expect(page.url()).toContain('/dashboard');
} catch (error) {
  await screenshot('navigation-error');
  console.log('⚠️ Navigation failed:', error.message);
}
```

### 5. 독립적인 테스트

```javascript
// ✅ Good: 각 테스트가 독립적
beforeEach(async () => {
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
  });
});

// ❌ Bad: 이전 테스트에 의존
test('depends on previous test', async () => {
  // 이전 테스트의 상태에 의존
});
```

---

## 🐛 디버깅 팁

### 1. 브라우저 표시 모드

```bash
npm run test:e2e:headful
```

### 2. 슬로우 모션

```bash
npm run test:e2e:slow
```

### 3. 디버그 모드 (추천)

```bash
npm run test:e2e:debug
```

### 4. 특정 테스트만 실행

```bash
npm run test:e2e -- auth.e2e.test.js
```

### 5. 테스트 일시 중지

```javascript
test('debug test', async () => {
  await page.goto(`${BASE_URL}/login`);

  // 여기서 브라우저 검사 가능
  await page.waitForTimeout(60000); // 1분 대기
});
```

### 6. 콘솔 로그 확인

```javascript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
```

---

## 📊 테스트 결과 분석

### Jest 출력 예시

```
PASS e2e/auth.e2e.test.js (15.2s)
  인증 플로우 E2E 테스트
    ✓ 로그인 페이지가 정상적으로 로드되어야 함 (2156ms)
    ✓ 빈 필드로 로그인 시도 시 검증 에러가 표시되어야 함 (782ms)
    ✓ 잘못된 인증 정보로 로그인 시도 시 에러가 표시되어야 함 (3215ms)
    ✓ 올바른 인증 정보로 로그인 성공해야 함 (4532ms)
    ✓ 로그아웃 시 로그인 페이지로 리다이렉트되고 토큰이 삭제되어야 함 (2318ms)
    ✓ 인증되지 않은 사용자는 대시보드 접근 시 로그인 페이지로 리다이렉트되어야 함 (1523ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        16.785s
```

### 스크린샷 확인

테스트 실행 후 `e2e/screenshots/` 폴더에서 각 단계의 스크린샷을 확인할 수 있습니다.

---

## 🚨 일반적인 문제 해결

### 1. "Cannot find module 'puppeteer'"

```bash
npm install --save-dev puppeteer jest-puppeteer
```

### 2. "TimeoutError: Navigation timeout"

- 백엔드 서버가 실행 중인지 확인
- 네트워크 속도 확인
- timeout 값 증가: `{ timeout: 30000 }`

### 3. "Element not found"

- 페이지 로드 대기: `await page.waitForSelector()`
- 셀렉터 확인
- 스크린샷으로 페이지 상태 확인

### 4. 테스트가 간헐적으로 실패

- `page.waitForNavigation()` 사용
- `networkidle0` 또는 `networkidle2` 대기
- 적절한 대기 시간 추가

### 5. "Port 3001 already in use"

```bash
# Next.js dev 서버 종료
lsof -ti:3001 | xargs kill -9
```

---

## 🔄 CI/CD 통합

### GitHub Actions 예시

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend/admin
          npm install

      - name: Start backend
        run: |
          cd backend
          npm install
          npm run start:dev &
          sleep 10

      - name: Run E2E tests
        run: |
          cd frontend/admin
          npm run test:e2e

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: frontend/admin/e2e/screenshots/
```

---

## 📚 참고 자료

- [Puppeteer 공식 문서](https://pptr.dev/)
- [Jest Puppeteer](https://github.com/smooth-code/jest-puppeteer)
- [Axe-core](https://www.deque.com/axe/core-documentation/)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 💡 추가 개선 사항

### 단기 (1-2주)
- [ ] Visual regression testing (Percy/BackstopJS)
- [ ] 성능 테스트 (Lighthouse CI)
- [ ] Cross-browser testing (Firefox, Safari)

### 중기 (1-2개월)
- [ ] API mocking (MSW)
- [ ] 테스트 데이터 관리
- [ ] 병렬 테스트 실행

### 장기 (3개월+)
- [ ] Load testing
- [ ] Security testing
- [ ] Mobile device testing (Playwright)

---

**작성자**: QA Team
**최종 수정**: 2025-10-15
**문서 버전**: 1.0
