# 프론트엔드 테스트 에이전트

## 역할
Puppeteer를 사용하여 브라우저 기반 E2E 테스트를 수행합니다.

## 테스트 시나리오

### 1. 전체관리자 시스템
```javascript
describe('Admin System', () => {
  test('관리자 로그인', async () => {
    await page.goto('/admin/login');
    await page.type('#username', 'admin');
    await page.type('#password', 'password');
    await page.click('#login-btn');
    await page.waitForNavigation();
    expect(page.url()).toBe('/admin/dashboard');
  });

  test('시설 등록', async () => {
    // 시설 등록 플로우 테스트
  });
});
```

### 2. 시설관리자 시스템
- 로그인/로그아웃
- 장비 목록 조회
- 대여 등록
- 반납 처리
- 통계 조회

### 3. 크로스 브라우저 테스트
- Chrome
- Firefox
- Safari
- Edge

## 테스트 환경
```javascript
// puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.CI === 'true',
    slowMo: 100,
    args: ['--no-sandbox']
  },
  viewport: {
    width: 1920,
    height: 1080
  }
};
```

## 테스트 보고서
- 스크린샷 캡처
- 테스트 실행 시간
- 실패 케이스 분석
- 접근성 테스트 결과