import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));

  try {
    console.log('Navigate to login...');
    await page.goto('http://localhost:3000/login-v2');
    await page.waitForLoadState('networkidle');

    console.log('Fill credentials...');
    await page.fill('input[type="email"]', 'admin@service4me.co.uk');
    await page.fill('input[type="password"]', 'gate123');

    console.log('Click Sign In...');
    await page.click('button[type="submit"]');

    console.log('Wait 5 seconds...');
    await page.waitForTimeout(5000);

    console.log('\nFINAL STATE:');
    console.log('URL:', page.url());

    await page.screenshot({ path: 'quick-test.png' });

    // Keep open for inspection
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
