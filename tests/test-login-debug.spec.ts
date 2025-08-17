import { test, expect } from '@playwright/test';

test('debug login flow for stylist user', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    console.log(`🖥️  [BROWSER] ${msg.type()}: ${msg.text()}`);
  });

  console.log('🎯 Starting login test...');
  
  // Go to login page
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  console.log('📝 Filling login form...');
  
  // Fill in login credentials for a known stylist
  await page.fill('input[type="email"]', 'tolu1998@hotmail.co.uk');
  await page.fill('input[type="password"]', 'gate123');
  
  // Take screenshot before login
  await page.screenshot({ path: 'login-before-submit.png', fullPage: true });
  
  console.log('🔑 Clicking sign in button...');
  
  // Click sign in and wait for response
  const signInButton = page.locator('button[type="submit"]');
  await signInButton.click();
  
  // Wait a bit and check loading state
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'login-after-submit.png', fullPage: true });
  
  // Check if still loading
  const isLoading = await page.locator('button[type="submit"]').getAttribute('disabled');
  console.log('🔄 Button disabled (loading):', isLoading);
  
  // Wait longer and see what happens
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'login-after-wait.png', fullPage: true });
  
  // Check current URL
  const currentUrl = page.url();
  console.log('🔗 Current URL:', currentUrl);
  
  // Check if we're on a dashboard page
  if (currentUrl.includes('/dashboard')) {
    console.log('✅ Redirected to dashboard');
    if (currentUrl.includes('/dashboard/stylist')) {
      console.log('✅ Correctly redirected to stylist dashboard');
    } else if (currentUrl.includes('/dashboard/client')) {
      console.log('❌ Incorrectly redirected to client dashboard');
    }
  } else {
    console.log('❌ Still on login page or other page');
  }
  
  // Check for any error messages
  const errorElement = page.locator('.bg-red-100');
  if (await errorElement.count() > 0) {
    const errorMsg = await errorElement.textContent();
    console.log('❌ Error message:', errorMsg);
  }
  
  // Final screenshot
  await page.screenshot({ path: 'login-final-state.png', fullPage: true });
});