import { chromium } from 'playwright';

(async () => {
  // Start with a fresh browser context (no stored sessions)
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: undefined // Start fresh, no cookies/localStorage
  });
  const page = await context.newPage();

  // Collect console logs
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });

  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  try {
    console.log('\n=== FRESH LOGIN TEST ===\n');

    console.log('1. Navigate to login page...');
    await page.goto('http://localhost:3000/login-v2');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'fresh-1-login-page.png' });
    console.log('   ✓ Login page loaded');

    console.log('\n2. Fill in admin credentials...');
    await page.fill('input[type="email"]', 'admin@service4me.co.uk');
    await page.fill('input[type="password"]', 'gate123');
    await page.screenshot({ path: 'fresh-2-filled.png' });
    console.log('   ✓ Credentials filled');

    console.log('\n3. Click Sign In...');
    await page.click('button[type="submit"]');

    // Wait for redirect
    console.log('\n4. Waiting for redirect...');
    await page.waitForTimeout(3000);
    console.log('   Current URL:', page.url());
    await page.screenshot({ path: 'fresh-3-after-login.png' });

    // Check if we're on the admin dashboard
    if (page.url().includes('/admin')) {
      console.log('   ✓ Successfully redirected to admin dashboard!');

      // Wait for page to fully load
      console.log('\n5. Waiting for dashboard to load...');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'fresh-4-dashboard-loaded.png' });

      // Check what's visible
      const bodyText = await page.textContent('body');
      console.log('   Page contains:', bodyText.slice(0, 200) + '...');

    } else {
      console.log('   ✗ Did not redirect to admin dashboard');
      console.log('   Current URL:', page.url());
    }

    console.log('\n=== FINAL STATE ===');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());

    // Keep browser open to see the result
    console.log('\nKeeping browser open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'fresh-error.png' });
  } finally {
    await browser.close();
    console.log('\nTest complete.');
  }
})();
