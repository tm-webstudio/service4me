import { test, expect } from '@playwright/test';

test('Manual investigation of data loading', async ({ page }) => {
  console.log('\n=== Manual Investigation of Data Loading ===');
  
  // Setup console logging
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Go to browse page
  await page.goto('/browse');
  
  // Wait for initial load
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/manual-initial.png',
    fullPage: true 
  });
  
  console.log('\n1. Checking loading state...');
  
  // Check if loading indicator is visible
  const loadingText = await page.locator('text="Loading stylists"').isVisible();
  console.log('Loading indicator visible:', loadingText);
  
  // Wait a few seconds to see what happens
  await page.waitForTimeout(3000);
  
  // Check final state
  const stylistCards = await page.locator('a[href^="/stylist/"]').count();
  const errorText = await page.locator('text="Unable to load stylists"').isVisible();
  const sampleDataText = await page.locator('text="sample data"').isVisible();
  
  console.log('Stylist cards found:', stylistCards);
  console.log('Error message visible:', errorText);
  console.log('Sample data message visible:', sampleDataText);
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/manual-final.png',
    fullPage: true 
  });
  
  console.log('\n2. Testing navigation to login...');
  
  // Find and click login/signup
  const loginButton = page.locator('text="Sign In"').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await page.waitForURL('**/login');
    await page.screenshot({ 
      path: 'tests/screenshots/manual-login-page.png',
      fullPage: true 
    });
    console.log('Successfully navigated to login page');
  } else {
    console.log('Login button not found');
  }
  
  console.log('\n3. Investigation complete');
});