// E2E 테스트 전역 설정

// 전역 타임아웃 설정
jest.setTimeout(60000);

// 전역 변수
global.BASE_URL = 'http://localhost:3001';
global.API_URL = 'http://localhost:3000';

// 테스트 전 설정
beforeAll(async () => {
  console.log('🚀 E2E 테스트 시작');
  console.log('📍 Base URL:', global.BASE_URL);
  console.log('🔌 API URL:', global.API_URL);
});

// 각 테스트 후 설정
afterEach(async () => {
  // 로그아웃 처리 (다음 테스트를 위해)
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // 무시
  }
});

// 전역 헬퍼 함수
global.waitForSelector = async (selector, options = {}) => {
  return await page.waitForSelector(selector, {
    visible: true,
    timeout: 10000,
    ...options,
  });
};

global.clickAndWait = async (selector, waitForNavigation = true) => {
  await page.click(selector);
  if (waitForNavigation) {
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
};

global.typeAndWait = async (selector, text, delay = 50) => {
  await page.waitForSelector(selector);
  await page.type(selector, text, { delay });
};

global.screenshot = async (name) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  await page.screenshot({
    path: `e2e/screenshots/${name}_${timestamp}.png`,
    fullPage: true,
  });
};

console.log('✅ E2E 테스트 환경 설정 완료');
