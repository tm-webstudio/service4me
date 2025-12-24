import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const log = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(log);
    console.log(log);
  });

  // Collect errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
    consoleLogs.push(`[ERROR] ${error.message}`);
  });

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login-v2');
    await page.waitForLoadState('networkidle');

    console.log('\n=== Login Page Loaded ===');
    await page.screenshot({ path: 'login-1-initial.png' });

    console.log('\n=== Filling credentials ===');
    await page.fill('input[type="email"]', 'admin@service4me.co.uk');
    await page.fill('input[type="password"]', 'gate123');
    await page.screenshot({ path: 'login-2-filled.png' });

    console.log('\n=== Clicking Sign In ===');
    await page.click('button[type="submit"]');

    // Wait and watch for redirect
    console.log('\n=== Waiting 2 seconds ===');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login-3-after-2s.png' });
    console.log('After 2s - URL:', page.url());

    console.log('\n=== Waiting 5 more seconds ===');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'login-4-after-7s.png' });
    console.log('After 7s - URL:', page.url());

    console.log('\n=== Waiting 5 more seconds ===');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'login-5-after-12s.png' });
    console.log('After 12s - URL:', page.url());

    console.log('\n=== Final State ===');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());

    console.log('\n=== Console Logs ===');
    console.log(consoleLogs.join('\n'));

  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'error.png' });
  } finally {
    // Keep browser open for 30 seconds so you can see it
    console.log('\nKeeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
})();
