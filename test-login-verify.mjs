import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    // Capture React errors
    if (msg.type() === 'error' || text.includes('Cannot update a component')) {
      errors.push(text);
      console.log('❌ ERROR:', text);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ PAGE ERROR:', error.message);
  });

  try {
    console.log('🧪 Testing login flow for React errors...\n');

    console.log('1. Navigate to login...');
    await page.goto('http://localhost:3000/login-v2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('2. Fill credentials...');
    await page.fill('input[type="email"]', 'admin@service4me.co.uk');
    await page.fill('input[type="password"]', 'gate123');

    console.log('3. Submit login...');
    await page.click('button[type="submit"]');

    console.log('4. Wait for redirect...');
    await page.waitForTimeout(5000);

    console.log('\n📊 RESULTS:');
    console.log('Final URL:', page.url());

    if (errors.length === 0) {
      console.log('✅ No React errors detected!');
    } else {
      console.log(`❌ Found ${errors.length} error(s):`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 200)}...`);
      });
    }

    await page.screenshot({ path: 'verify-test.png' });

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
