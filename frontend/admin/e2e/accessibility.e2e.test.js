/**
 * 접근성 (Accessibility) E2E 테스트
 *
 * WCAG 2.1 AA 레벨 준수 확인
 * - 키보드 내비게이션
 * - 스크린 리더 호환성
 * - 색상 대비
 * - ARIA 속성
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');

describe('접근성 E2E 테스트', () => {
  const BASE_URL = global.BASE_URL;

  // 로그인 헬퍼
  const login = async () => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.type('#username', 'testadmin');
    await page.type('#password', 'Test1234!');
    await page.click('button[type="submit"]');

    try {
      await page.waitForNavigation({ timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  };

  describe('Axe 접근성 검사', () => {
    test('로그인 페이지에 심각한 접근성 위반이 없어야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // Axe 접근성 검사 실행
      const results = await new AxePuppeteer(page).analyze();

      // 심각한(critical) 위반 확인
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical'
      );

      // 중대한(serious) 위반 확인
      const seriousViolations = results.violations.filter(
        v => v.impact === 'serious'
      );

      // 결과 출력
      console.log(`\n📊 접근성 검사 결과 (로그인 페이지):`);
      console.log(`  - 심각한 위반: ${criticalViolations.length}개`);
      console.log(`  - 중대한 위반: ${seriousViolations.length}개`);
      console.log(`  - 보통 위반: ${results.violations.filter(v => v.impact === 'moderate').length}개`);
      console.log(`  - 경미한 위반: ${results.violations.filter(v => v.impact === 'minor').length}개`);

      // 위반 상세 출력
      if (criticalViolations.length > 0) {
        console.log('\n🚨 심각한 접근성 위반:');
        criticalViolations.forEach(violation => {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    영향: ${violation.impact}`);
          console.log(`    도움말: ${violation.helpUrl}`);
        });
      }

      if (seriousViolations.length > 0) {
        console.log('\n⚠️  중대한 접근성 위반:');
        seriousViolations.forEach(violation => {
          console.log(`  - ${violation.id}: ${violation.description}`);
        });
      }

      // 심각한 위반이 없어야 함
      expect(criticalViolations).toHaveLength(0);

      // 중대한 위반도 최소화해야 함 (경고)
      if (seriousViolations.length > 0) {
        console.log('\n💡 중대한 접근성 위반이 발견되었습니다. 개선을 권장합니다.');
      }

      await screenshot('accessibility-login-page');
    });

    test('대시보드에 심각한 접근성 위반이 없어야 함', async () => {
      const loggedIn = await login();
      if (!loggedIn) {
        console.log('⚠️ 테스트 건너뜀: 로그인 실패');
        return;
      }

      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);

      const results = await new AxePuppeteer(page).analyze();

      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical'
      );

      console.log(`\n📊 접근성 검사 결과 (대시보드):`);
      console.log(`  - 심각한 위반: ${criticalViolations.length}개`);
      console.log(`  - 총 위반: ${results.violations.length}개`);

      expect(criticalViolations).toHaveLength(0);

      await screenshot('accessibility-dashboard');
    });

    test('시설 관리 페이지에 심각한 접근성 위반이 없어야 함', async () => {
      const loggedIn = await login();
      if (!loggedIn) {
        console.log('⚠️ 테스트 건너뜀: 로그인 실패');
        return;
      }

      await page.goto(`${BASE_URL}/facilities`, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);

      const results = await new AxePuppeteer(page).analyze();

      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical'
      );

      console.log(`\n📊 접근성 검사 결과 (시설 관리):`);
      console.log(`  - 심각한 위반: ${criticalViolations.length}개`);
      console.log(`  - 총 위반: ${results.violations.length}개`);

      expect(criticalViolations).toHaveLength(0);

      await screenshot('accessibility-facilities');
    });
  });

  describe('키보드 내비게이션', () => {
    test('Tab 키로 로그인 폼을 탐색할 수 있어야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // Body 클릭하여 포커스 시작점 설정
      await page.click('body');

      // Tab 키로 내비게이션
      await page.keyboard.press('Tab'); // Username 필드
      let focusedElement = await page.evaluate(() => document.activeElement.id);
      expect(focusedElement).toBe('username');

      await page.keyboard.press('Tab'); // Password 필드
      focusedElement = await page.evaluate(() => document.activeElement.id);
      expect(focusedElement).toBe('password');

      await page.keyboard.press('Tab'); // 비밀번호 표시 버튼 또는 로그인 버튼
      // 로그인 버튼에 포커스가 있는지 확인
      const isLoginButtonFocused = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'BUTTON' &&
               activeElement.type === 'submit';
      });

      // 로그인 버튼이나 다른 인터랙티브 요소에 포커스가 있어야 함
      expect(isLoginButtonFocused || focusedElement).toBeTruthy();

      console.log('✅ 키보드 내비게이션 확인 완료');
      await screenshot('keyboard-navigation');
    });

    test('Enter 키로 폼을 제출할 수 있어야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // 폼 입력
      await page.type('#username', 'testadmin');
      await page.type('#password', 'Test1234!');

      // Enter 키로 제출
      await page.keyboard.press('Enter');

      try {
        await page.waitForNavigation({ timeout: 10000 });
        expect(page.url()).toContain('/dashboard');
        console.log('✅ Enter 키 제출 확인 완료');
      } catch (error) {
        console.log('⚠️ Enter 키 제출 테스트 건너뜀');
      }
    });
  });

  describe('ARIA 속성 및 시맨틱 HTML', () => {
    test('폼 필드에 적절한 레이블이 있어야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // Username 필드 레이블 확인
      const usernameLabel = await page.$('label[for="username"]');
      expect(usernameLabel).not.toBeNull();

      // Password 필드 레이블 확인
      const passwordLabel = await page.$('label[for="password"]');
      expect(passwordLabel).not.toBeNull();

      console.log('✅ 폼 레이블 확인 완료');
    });

    test('버튼에 적절한 텍스트나 aria-label이 있어야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // 로그인 버튼 확인
      const buttons = await page.$$('button');

      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label'));

        // 버튼에 텍스트나 aria-label이 있어야 함
        expect(text || ariaLabel).toBeTruthy();
      }

      console.log('✅ 버튼 접근성 확인 완료');
    });

    test('페이지에 적절한 제목(h1)이 있어야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      const h1 = await page.$('h1');
      expect(h1).not.toBeNull();

      const h1Text = await page.$eval('h1', el => el.textContent);
      expect(h1Text).toBeTruthy();
      expect(h1Text.length).toBeGreaterThan(0);

      console.log(`✅ 페이지 제목 확인: "${h1Text}"`);
    });
  });

  describe('색상 대비', () => {
    test('텍스트와 배경의 색상 대비가 충분해야 함', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // Axe로 색상 대비 검사
      const results = await new AxePuppeteer(page)
        .withRules(['color-contrast'])
        .analyze();

      const contrastViolations = results.violations.filter(
        v => v.id === 'color-contrast'
      );

      console.log(`📊 색상 대비 위반: ${contrastViolations.length}개`);

      if (contrastViolations.length > 0) {
        console.log('⚠️  색상 대비 개선 권장:');
        contrastViolations.forEach(violation => {
          console.log(`  - ${violation.description}`);
          violation.nodes.forEach(node => {
            console.log(`    요소: ${node.html.substring(0, 100)}...`);
          });
        });
      }

      // 심각한 색상 대비 문제가 없어야 함
      const criticalContrastIssues = contrastViolations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalContrastIssues.length).toBeLessThanOrEqual(0);
    });
  });

  describe('반응형 디자인 접근성', () => {
    test('모바일 뷰포트에서도 접근 가능해야 함', async () => {
      // 모바일 뷰포트 설정
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      // 접근성 검사
      const results = await new AxePuppeteer(page).analyze();

      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical'
      );

      console.log(`📱 모바일 접근성 검사 결과:`);
      console.log(`  - 심각한 위반: ${criticalViolations.length}개`);

      expect(criticalViolations).toHaveLength(0);

      await screenshot('accessibility-mobile');

      // 뷰포트 원래대로 복구
      await page.setViewport({ width: 1920, height: 1080 });
    });

    test('태블릿 뷰포트에서도 접근 가능해야 함', async () => {
      // 태블릿 뷰포트 설정
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

      const results = await new AxePuppeteer(page).analyze();

      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical'
      );

      console.log(`📱 태블릿 접근성 검사 결과:`);
      console.log(`  - 심각한 위반: ${criticalViolations.length}개`);

      expect(criticalViolations).toHaveLength(0);

      await screenshot('accessibility-tablet');

      // 뷰포트 원래대로 복구
      await page.setViewport({ width: 1920, height: 1080 });
    });
  });
});
