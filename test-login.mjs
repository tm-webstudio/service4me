import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login-v2');
    await page.waitForLoadState('networkidle');

    console.log('Page loaded. Taking screenshot...');
    await page.screenshot({ path: 'login-page.png' });
    console.log('Screenshot saved: login-page.png');

    console.log('Filling in credentials...');
    // Fill in the email field
    await page.fill('input[type="email"]', 'admin@service4me.co.uk');

    // Fill in the password field
    await page.fill('input[type="password"]', 'gate123');

    console.log('Taking screenshot of filled form...');
    await page.screenshot({ path: 'login-filled.png' });
    console.log('Screenshot saved: login-filled.png');

    console.log('Clicking sign in button...');
    // Click the sign in button
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForTimeout(3000);

    console.log('After submit - URL:', page.url());
    console.log('After submit - Title:', await page.title());

    // Take screenshot of result
    await page.screenshot({ path: 'after-login.png' });
    console.log('Screenshot saved: after-login.png');

    // Check console logs
    const logs = [];
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    // Wait a bit more to see what happens
    await page.waitForTimeout(2000);

    console.log('\nFinal state:');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());

  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: 'error.png' });
    console.log('Error screenshot saved: error.png');
  } finally {
    await browser.close();
  }
})();
